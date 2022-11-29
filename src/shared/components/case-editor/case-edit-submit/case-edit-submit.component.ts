import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { CaseEventData, CaseEventTrigger, CaseField, HttpError, Profile } from '../../../domain';
import { Task } from '../../../domain/work-allocation/Task';
import {
  CaseFieldService,
  FieldsUtils,
  FormErrorService,
  FormValueService,
  OrderService,
  ProfileNotifier,
  SessionStorageService
} from '../../../services';
import { CallbackErrorsComponent, CallbackErrorsContext } from '../../error';
import { PaletteContext } from '../../palette';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Confirmation, Wizard, WizardPage } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { CaseNotifier } from '../services';

// @dynamic
@Component({
  selector: 'ccd-case-edit-submit',
  templateUrl: 'case-edit-submit.html',
  styleUrls: ['../case-edit.scss']
})
export class CaseEditSubmitComponent implements OnInit, OnDestroy {
  eventTrigger: CaseEventTrigger;
  editForm: FormGroup;
  error: HttpError;
  callbackErrorsSubject: Subject<any> = new Subject();
  ignoreWarning = false;
  triggerText: string;
  wizard: Wizard;
  profile: Profile;
  showSummaryFields: CaseField[];
  paletteContext: PaletteContext = PaletteContext.CHECK_YOUR_ANSWER;
  isSubmitting: boolean;
  profileSubscription: Subscription;
  contextFields: CaseField[];
  task: Task;
  eventCompletionParams: EventCompletionParams;
  eventCompletionChecksRequired = false;
  isCaseFlagSubmission = false;
  pageTitle: string;

  public static readonly SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION = (a: CaseField, b: CaseField): number => {
    const aCaseField = a.show_summary_content_option === 0 || a.show_summary_content_option;
    const bCaseField = b.show_summary_content_option === 0 || b.show_summary_content_option;

    if (!aCaseField) {
      return !bCaseField ? 0 : 1;
    }

    if (!bCaseField) {
      return -1;
    }
    return a.show_summary_content_option - b.show_summary_content_option;
  }

  public get isDisabled(): boolean {
    // EUI-3452.
    // We don't need to check the validity of the editForm as it is readonly.
    // This was causing issues with hidden fields that aren't wanted but have
    // not been disabled.
    return this.isSubmitting || this.hasErrors;
  }

  constructor(
    private readonly caseEdit: CaseEditComponent,
    private readonly formValueService: FormValueService,
    private readonly formErrorService: FormErrorService,
    private readonly fieldsUtils: FieldsUtils,
    private readonly caseFieldService: CaseFieldService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly orderService: OrderService,
    private readonly profileNotifier: ProfileNotifier,
    private readonly sessionStorageService: SessionStorageService,
    private readonly caseNotifier: CaseNotifier,
  ) {
  }

  public ngOnInit(): void {
    this.profileSubscription = this.profileNotifier.profile.subscribe(_ => this.profile = _);
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.triggerText = this.eventTrigger.end_button_label || CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.showSummaryFields = this.sortFieldsByShowSummaryContent(this.eventTrigger.case_fields);
    this.isSubmitting = false;
    this.contextFields = this.getCaseFields();
    // Indicates if the submission is for a Case Flag, as opposed to a "regular" form submission, by the presence of
    // a FlagLauncher field in the event trigger
    this.isCaseFlagSubmission = this.eventTrigger.case_fields.some(
      caseField => FieldsUtils.isFlagLauncherCaseField(caseField));
    this.pageTitle = this.isCaseFlagSubmission ? 'Review flag details' : 'Check your answers';
  }

  public ngOnDestroy(): void {
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  /**
   * Handler function for event completion
   *
   * @memberof CaseEditSubmitComponent
   */
  public submit(): void {
    this.isSubmitting = true;

    // We have to run the event completion checks if task in session storage
    // and if the task is in session storage, then is it associated to the case
    let taskInSessionStorage: Task;
    const taskStr = this.sessionStorageService.getItem('taskToComplete');
    if (taskStr) {
      taskInSessionStorage = JSON.parse(taskStr);
    }

    if (taskInSessionStorage && taskInSessionStorage.case_id === this.getCaseId()) {
      // Show event completion component to perform event completion checks
      this.eventCompletionParams = {
        caseId: this.getCaseId(),
        eventId: this.getEventId(),
        task: taskInSessionStorage
      };
      this.eventCompletionChecksRequired = true;
    } else {
      // Task not in session storage, proceed to submit
      const caseEventData = this.generateCaseEventData();
      this.caseSubmit(caseEventData);
    }
  }

  /**
   * Handler function for event emitted from case event completion component
   *
   * @param {boolean} eventCanBeCompleted
   * @memberof CaseEditSubmitComponent
   */
  public onEventCanBeCompleted(eventCanBeCompleted: boolean): void {
    if (eventCanBeCompleted) {
      // Submit
      const caseEventData = this.generateCaseEventData();
      this.caseSubmit(caseEventData);
    } else {
      // Navigate to tasks tab on case details page
      this.router.navigate([`/cases/case-details/${this.getCaseId()}/tasks`], { relativeTo: this.route });
    }
  }

  /**
   * Function to generate and return case event data for completing the event
   *
   * @private
   * @return {*}  {CaseEventData}
   * @memberof CaseEditSubmitComponent
   */
  private generateCaseEventData(): CaseEventData {
    const caseEventData: CaseEventData = {
      data: this.replaceEmptyComplexFieldValues(
        this.formValueService.sanitise(
          this.replaceHiddenFormValuesWithOriginalCaseData(
            this.editForm.get('data') as FormGroup, this.eventTrigger.case_fields))),
      event: this.editForm.value.event
    } as CaseEventData;
    this.formValueService.clearNonCaseFields(caseEventData.data, this.eventTrigger.case_fields);
    this.formValueService.removeNullLabels(caseEventData.data, this.eventTrigger.case_fields);
    this.formValueService.removeEmptyDocuments(caseEventData.data, this.eventTrigger.case_fields);
    // Remove collection fields that have "min" validation of greater than zero set on the FieldType but are empty;
    // these will fail validation
    this.formValueService.removeEmptyCollectionsWithMinValidation(caseEventData.data, this.eventTrigger.case_fields);
    // If this is a Case Flag submission (and thus a FlagLauncher field is present in the event trigger), the flag
    // details data needs populating for each Flags field, then the FlagLauncher field needs removing
    if (this.isCaseFlagSubmission) {
      this.formValueService.populateFlagDetailsFromCaseFields(caseEventData.data, this.eventTrigger.case_fields);
      this.formValueService.removeFlagLauncherField(caseEventData.data, this.eventTrigger.case_fields);
    }
    caseEventData.event_token = this.eventTrigger.event_token;
    caseEventData.ignore_warning = this.ignoreWarning;
    if (this.caseEdit.confirmation) {
      caseEventData.data = {};
    }

    return caseEventData;
  }

  /**
   * Function to complete the event
   *
   * @private
   * @param {CaseEventData} caseEventData
   * @memberof CaseEditSubmitComponent
   */
  private caseSubmit(caseEventData: CaseEventData): void {
    this.caseEdit.submit(caseEventData)
      .subscribe(
        response => {
          this.caseNotifier.cachedCaseView = null;
          const confirmation: Confirmation = this.buildConfirmation(response);
          if (confirmation && (confirmation.getHeader() || confirmation.getBody())) {
            this.caseEdit.confirm(confirmation);
          } else {
            this.caseEdit.submitted.emit({caseId: response['id'], status: this.getStatus(response)});
          }
        },
        error => {
          this.error = error;
          this.callbackErrorsSubject.next(this.error);
          if (this.error.details) {
            this.formErrorService
              .mapFieldErrors(this.error.details.field_errors, this.editForm.controls['data'] as FormGroup, 'validation');
          }
          this.isSubmitting = false;
        }
      );
  }

  /**
   * Traverse *all* values of a {@link FormGroup}, including those for disabled fields (i.e. hidden ones), replacing the
   * value of any that are hidden AND have `retain_hidden_value` set to `true` in the corresponding `CaseField`, with
   * the *original* value held in the `CaseField` object.
   *
   * This is as per design in EUI-3622, where any user-driven updates to hidden fields with `retain_hidden_value` =
   * `true` are ignored (thus retaining the value displayed originally).
   *
   * * For Complex field types, the replacement above is performed recursively for all hidden sub-fields with
   * `retain_hidden_value` = `true`.
   *
   * * For Collection field types, including collections of Complex and Document field types, the replacement is
   * performed for all fields in the collection.
   *
   * @param formGroup The `FormGroup` instance whose raw values are to be traversed
   * @param caseFields The array of {@link CaseField} domain model objects corresponding to fields in `formGroup`
   * @param parentField Reference to the parent `CaseField`. Used for retrieving the sub-field values of a Complex field
   * to perform recursive replacement - the sub-field `CaseField`s themselves do *not* contain any values
   * @returns An object with the *raw* form value data (as key-value pairs), with any value replacements as necessary
   */
  private replaceHiddenFormValuesWithOriginalCaseData(formGroup: FormGroup, caseFields: CaseField[], parentField?: CaseField): object {
    // Get the raw form value data, which includes the values of any disabled controls, as key-value pairs
    const rawFormValueData = formGroup.getRawValue();

    // Place all case fields in a lookup object, so they can be retrieved by id
    const caseFieldsLookup = {};
    for (let i = 0, len = caseFields.length; i < len; i++) {
      caseFieldsLookup[caseFields[i].id] = caseFields[i];
    }

    /**
     * Replace any form value with the original, where its CaseField is hidden AND has the retain_hidden_value flag set
     * to true.
     *
     * If the CaseField's `hidden` attribute is null or undefined, then check this attribute in the parent CaseField (if
     * one exists). This is occurring (and is possibly a bug) when a CaseField is a sub-field of a Complex type, or an
     * item in a Collection type.
     *
     * If the field is a Complex type with retain_hidden_value = true, perform a recursive replacement for all (hidden)
     * sub-fields with retain_hidden_value = true, using their original CaseField values (from the `formatted_value`
     * attribute).
     *
     * If the field is a Collection type with retain_hidden_value = true, the entire collection is replaced with the
     * original from `formatted_value`. This applies to *all* types of Collections.
     */
    Object.keys(rawFormValueData).forEach((key) => {
      const caseField: CaseField = caseFieldsLookup[key];
      // If caseField.hidden is NOT truthy and also NOT equal to false, then it must be null/undefined (remember that
      // both null and undefined are equal to *neither false nor true*)
      if (caseField && caseField.retain_hidden_value &&
        (caseField.hidden || (caseField.hidden !== false && parentField && parentField.hidden))) {
        if (caseField.field_type.type === 'Complex') {
          // Note: Deliberate use of equality (==) and non-equality (!=) operators for null checks throughout, to
          // handle both null and undefined values
          if (caseField.value != null) {
            // Call this function recursively to replace the Complex field's sub-fields as necessary, passing the
            // CaseField itself (the sub-fields do not contain any values, so these need to be obtained from the
            // parent)
            // Update rawFormValueData for this field
            // creating form group and adding control into it in case caseField is of complext type and and part of formGroup
            let form: FormGroup = new FormGroup({});
            if (formGroup.controls[key].value) {
              Object.keys(formGroup.controls[key].value).forEach((item) => {
                form.addControl(item, new FormControl(formGroup.controls[key].value[item]));
              })
            }
            rawFormValueData[key] = this.replaceHiddenFormValuesWithOriginalCaseData(
              form, caseField.field_type.complex_fields, caseField);
          }
        } else {
          // Default case also handles collections of *all* types; the entire collection in rawFormValueData will be
          // replaced with the original from formatted_value
          // Use the CaseField's existing *formatted_value* from the parent, if available. (This is necessary for
          // Complex fields, whose sub-fields do not hold any values in the model.) Otherwise, use formatted_value
          // from the CaseField itself.
          if (parentField && parentField.formatted_value) {
            rawFormValueData[key] = parentField.formatted_value[caseField.id];
          } else {
            rawFormValueData[key] = caseField.formatted_value;
          }
        }
      }
    });

    return rawFormValueData;
  }

  /**
   * Replaces non-array value objects with `null` for any Complex-type fields whose value is effectively empty, i.e.
   * all its sub-fields and descendants are `null` or `undefined`.
   *
   * @param data The object tree representing all the form field data
   * @returns The form field data modified accordingly
   */
  private replaceEmptyComplexFieldValues(data: object): object {
    Object.keys(data).forEach((key) => {
      if (!Array.isArray(data[key]) && typeof data[key] === 'object' && !FieldsUtils.containsNonEmptyValues(data[key])) {
        data[key] = null;
      }
    });

    return data;
  }

  private getStatus(response: object): any {
    return this.hasCallbackFailed(response) ? response['callback_response_status'] : response['delete_draft_response_status'];
  }

  private hasCallbackFailed(response: object): boolean {
    return response['callback_response_status'] !== 'CALLBACK_COMPLETED';
  }

  private get hasErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  public navigateToPage(pageId: string): void {
    this.caseEdit.navigateToPage(pageId);
  }

  public callbackErrorsNotify(errorContext: CallbackErrorsContext): void {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  public summaryCaseField(field: CaseField): CaseField {
    if (null == this.editForm.get('data').get(field.id)) {
      // If not in form, return field itself
      return field;
    }

    const cloneField: CaseField = this.fieldsUtils.cloneCaseField(field);
    cloneField.value = this.editForm.get('data').get(field.id).value;

    return cloneField;
  }

  public cancel(): void {
    if (this.eventTrigger.can_save_draft) {
      if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
        this.caseEdit.cancelled.emit({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
      } else {
        this.caseEdit.cancelled.emit({status: CaseEditPageComponent.NEW_FORM_DISCARD});
      }
    } else {
      this.caseEdit.cancelled.emit();
    }
  }

  public isLabel(field: CaseField): boolean {
    return this.caseFieldService.isLabel(field);
  }

  public isChangeAllowed(field: CaseField): boolean {
    return !this.caseFieldService.isReadOnly(field);
  }

  public checkYourAnswerFieldsToDisplayExists(): boolean {
    if (!this.eventTrigger.show_summary) {
      return false;
    }

    for (const page of this.wizard.pages) {
      if (this.isShown(page)) {
        for (const field of page.case_fields) {
          if (this.canShowFieldInCYA(field)) {
            // at least one field needs showing
            return true;
          }
        }
      }
    }

    // found no fields to show in CYA summary page
    return false;
  }

  public readOnlySummaryFieldsToDisplayExists(): boolean {
    return this.eventTrigger.case_fields.some(field => field.show_summary_content_option >= 0 );
  }

  public showEventNotes(): boolean {
    return this.eventTrigger.show_event_notes !== false;
  }

  private getLastPageShown(): WizardPage {
    let lastPage: WizardPage;
    this.wizard.reverse().forEach(page => {
      if (!lastPage && this.isShown(page)) {
        lastPage = page;
      }
    });
    // noinspection JSUnusedAssignment
    return lastPage;
  }

  public previous(): void {
    if (this.hasPrevious()) {
      this.navigateToPage(this.getLastPageShown().id);
    }
  }

  public hasPrevious(): boolean {
    return !!this.getLastPageShown();
  }

  public isShown(page: WizardPage): boolean {
    const fields = this.fieldsUtils
      .mergeCaseFieldsAndFormFields(this.eventTrigger.case_fields, this.editForm.controls['data'].value);
    return page.parsedShowCondition.match(fields);
  }

  public canShowFieldInCYA(field: CaseField): boolean {
    return field.show_summary_change_option;
  }

  public isSolicitor(): boolean {
    return this.profile.isSolicitor();
  }

  private buildConfirmation(response: object): Confirmation {
    if (response['after_submit_callback_response']) {
      return new Confirmation(
        response['id'],
        response['callback_response_status'],
        response['after_submit_callback_response']['confirmation_header'],
        response['after_submit_callback_response']['confirmation_body']
      );
    } else {
      return null;
    }
  }

  private sortFieldsByShowSummaryContent(fields: CaseField[]): CaseField[] {
    return this.orderService
      .sort(fields, CaseEditSubmitComponent.SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION)
      .filter(cf => cf.show_summary_content_option);
  }

  private getCaseFields(): CaseField[] {
    if (this.caseEdit.caseDetails) {
      return FieldsUtils.getCaseFields(this.caseEdit.caseDetails);
    }

    return this.eventTrigger.case_fields;
  }

  public getCaseId(): string {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  public getEventId(): string {
    return this.editForm.value.event.id;
  }

  public getCaseTitle(): string {
    return (this.caseEdit.caseDetails && this.caseEdit.caseDetails.state &&
    this.caseEdit.caseDetails.state.title_display ? this.caseEdit.caseDetails.state.title_display : '');
  }

  public getCancelText(): string {
    if (this.eventTrigger.can_save_draft) {
      return 'Return to case list';
    } else {
      return 'Cancel';
    }
  }
}
