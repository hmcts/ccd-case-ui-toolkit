import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { CaseEventData, CaseEventTrigger, CaseField, FieldTypeEnum, HttpError, Profile } from '../../../domain';
import {
  CaseFieldService,
  FieldsUtils,
  FormErrorService,
  FormValueService,
  OrderService,
  ProfileNotifier,
  ProfileService,
} from '../../../services';
import { CallbackErrorsComponent, CallbackErrorsContext } from '../../error';
import { PaletteContext } from '../../palette';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Confirmation, Wizard, WizardPage } from '../domain';

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

  public static readonly SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION = (a: CaseField, b: CaseField) => {
    let aCaseField = a.show_summary_content_option === 0 || a.show_summary_content_option;
    let bCaseField = b.show_summary_content_option === 0 || b.show_summary_content_option;

    if (!aCaseField) {
      return !bCaseField ? 0 : 1;
    }

    if (!bCaseField) {
      return -1;
    }
    return a.show_summary_content_option - b.show_summary_content_option;
  }

  constructor(
    private caseEdit: CaseEditComponent,
    private formValueService: FormValueService,
    private formErrorService: FormErrorService,
    private fieldsUtils: FieldsUtils,
    private caseFieldService: CaseFieldService,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private profileService: ProfileService,
    private profileNotifier: ProfileNotifier,
  ) {
  }

  ngOnInit(): void {
    this.profileSubscription = this.profileNotifier.profile.subscribe(_ => this.profile = _);
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.triggerText = this.eventTrigger.end_button_label || CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.announceProfile(this.route);
    this.showSummaryFields = this.sortFieldsByShowSummaryContent(this.eventTrigger.case_fields);
    this.isSubmitting = false;
  }

  ngOnDestroy() {
    this.profileSubscription.unsubscribe();
  }

  submit(): void {
    this.isSubmitting = true;
    let caseEventData: CaseEventData = {
      data: this.formValueService.sanitise(
        this.filterRawFormValues(this.editForm.get('data') as FormGroup, this.eventTrigger.case_fields)),
      event: this.editForm.value.event
    } as CaseEventData
    this.formValueService.clearNonCaseFields(caseEventData.data, this.eventTrigger.case_fields);
    this.formValueService.removeNullLabels(caseEventData.data, this.eventTrigger.case_fields);
    this.formValueService.removeEmptyDocuments(caseEventData.data, this.eventTrigger.case_fields);
    caseEventData.event_token = this.eventTrigger.event_token;
    caseEventData.ignore_warning = this.ignoreWarning;
    this.caseEdit.submit(caseEventData)
      .subscribe(
        response => {
          let confirmation: Confirmation = this.buildConfirmation(response);
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
   * Filter *all* the values of a {@link FormGroup}, including those for disabled fields (i.e. hidden ones), discarding
   * any whose {@link FormControl} is hidden (disabled) AND whose value is to be retained (i.e. `retain_hidden_value`
   * = `true`) OR whose value is **not** to be retained *where the value is empty*, for example, `null` or an empty
   * string or object. The latter is necessary to prevent superfluous updates.
   *
   * Hidden fields with *non-empty* values that are **not** to be retained are passed to the backend to be updated with
   * `null`.
   *
   * **Complex** fields with `retain_hidden_value` = `true` are filtered out ONLY if they do **not** contain any
   * sub-fields with *non-empty* values that are not to be retained.
   *
   * For Collection field types, including collections of Complex field types, the filter is applied to all fields in
   * the collection.
   *
   * @param formGroup The `FormGroup` instance whose raw values are to be filtered
   * @param caseFields The array of {@link CaseField} domain model objects corresponding to fields in the `formGroup`
   * @returns An object with the filtered *raw* form value data (as key-value pairs)
   */
  private filterRawFormValues(formGroup: FormGroup, caseFields: CaseField[]): object {
    // Get the raw form value data, which includes the values of any disabled controls, as key-value pairs
    const rawFormValueData = formGroup.getRawValue();

    // Place all case fields in a lookup object, so they can be retrieved by id
    const caseFieldsLookup = {};
    for (let i = 0, len = caseFields.length; i < len; i++) {
      caseFieldsLookup[caseFields[i].id] = caseFields[i];
    }

    /**
     * Discard any value where the CaseField is hidden AND has the retain_hidden_value flag set to true, OR set to
     * false AND the value is empty (these fields should not be updated in the backend).
     *
     * If the CaseField's `hidden` attribute is null or undefined, then check the corresponding FormGroup for status =
     * 'DISABLED' instead. This is occurring (and is possibly a bug) when a CaseField is a sub-field of a Complex type,
     * or an item in a Collection type.
     *
     * If the field is a Complex type with retain_hidden_value = true, check recursively for the presence of any
     * sub-fields with non-empty values that are not to be retained; do NOT discard the Complex field if any are found
     *
     * If the field is a Collection type with retain_hidden_value = true, the two procedures described above are
     * applied to the collection, depending on whether the collection type is non-Complex or Complex respectively.
     */
    Object.keys(rawFormValueData).forEach((key) => {
      const caseField: CaseField = caseFieldsLookup[key];
      if (caseField &&
        (caseField.hidden || (caseField.hidden !== false && formGroup.controls[key].status === 'DISABLED'))) {
        const fieldType: FieldTypeEnum = caseField.field_type.type;
        switch (fieldType) {
          // Note: Deliberate use of equality (==) and non-equality (!=) operators for null checks throughout, to
          // handle both null and undefined values
          case 'Complex':
            if (caseField.retain_hidden_value && caseField.value != null) {
              // Call this function recursively to check the Complex field's sub-fields
              const resultantObject = this.filterRawFormValues(
                formGroup.controls[key] as FormGroup, caseField.field_type.complex_fields);
              // If the resultant object from the recursive function call is empty, remove the *existing one* from
              // rawFormValueData altogether (effectively no update); else, update rawFormValueData for this field
              !FieldsUtils.isNonEmptyObject(resultantObject)
                ? delete rawFormValueData[key]
                : rawFormValueData[key] = resultantObject;
            }
            // Discard null, undefined, or empty Complex field values, to avoid submitting a superfluous update for
            // such fields
            if (caseField.value == null || !FieldsUtils.containsNonEmptyValues(caseField.value)) {
              delete rawFormValueData[key];
            }
            break;
          case 'Collection':
            if (caseField.value != null) {
              // If the collection is of a Complex field type, loop through each item and call this function recursively
              // to check each Complex field instance's sub-fields, updating rawFormValueData for this instance
              const collectionFieldType = caseField.field_type.collection_field_type;
              if (collectionFieldType.type === 'Complex' && collectionFieldType.complex_fields.length > 0) {
                if (caseField.retain_hidden_value) {
                  (caseField.value as any[]).forEach((_, index) => {
                    // Call this function recursively to check the Complex field's sub-fields
                    const complexFormGroup = (formGroup.controls[key] as FormArray).at(index).get('value') as FormGroup;
                    const complexSubFields = caseField.field_type.collection_field_type.complex_fields;
                    const resultantObject = this.filterRawFormValues(complexFormGroup, complexSubFields);
                    // If the resultant object from the recursive function call is empty, remove the *existing item*
                    // from the array in rawFormValueData altogether (effectively no update); else, update this item in
                    // the array
                    !FieldsUtils.isNonEmptyObject(resultantObject)
                      ? rawFormValueData[key].splice(index, 1)
                      : rawFormValueData[key][index].value = resultantObject;
                  });

                  // If the collection has been left empty as a result of removals above, remove the collection itself
                  if (rawFormValueData[key].length == 0) {
                    delete rawFormValueData[key];
                  }
                }
              } else if (collectionFieldType.type !== 'Complex') {
                if (caseField.retain_hidden_value) {
                  // If retain_hidden_value = true on the collection then this applies to all items in the collection,
                  // so remove the entire collection from rawFormValueData (effectively no update)
                  delete rawFormValueData[key];
                } else {
                  // Otherwise, replace the collection with an empty array, which will clear the existing items
                  rawFormValueData[key] = [];
                }
              }
            }

            // Discard null, undefined, or empty collections, to avoid submitting a superfluous update for such fields
            if (caseField.value == null || !FieldsUtils.containsNonEmptyValues(caseField.value)) {
              delete rawFormValueData[key];
            }
            break;
          default:
            if (caseField.retain_hidden_value || caseField.value == null || !FieldsUtils.containsNonEmptyValues(caseField.value)) {
              delete rawFormValueData[key];
            }
        }
      }
    });

    return rawFormValueData;
  }

  isDisabled(): boolean {
    return this.isSubmitting || !this.editForm.valid || this.hasErrors();
  }

  private getStatus(response) {
    return this.hasCallbackFailed(response) ? response['callback_response_status'] : response['delete_draft_response_status'];
  }

  private hasCallbackFailed(response) {
    return response['callback_response_status'] !== 'CALLBACK_COMPLETED';
  }

  private hasErrors(): boolean {
    return this.error
      && this.error.callbackErrors
      && this.error.callbackErrors.length;
  }

  navigateToPage(pageId: string): void {
    this.caseEdit.navigateToPage(pageId);
  }

  callbackErrorsNotify(errorContext: CallbackErrorsContext) {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  summaryCaseField(field: CaseField): CaseField {
    if (null == this.editForm.get('data').get(field.id)) {
      // If not in form, return field itself
      return field;
    }

    let cloneField: CaseField = this.fieldsUtils.cloneCaseField(field);
    cloneField.value = this.editForm.get('data').get(field.id).value;

    return cloneField;
  }

  cancel(): void {
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

  isLabel(field: CaseField): boolean {
    return this.caseFieldService.isLabel(field);
  }

  isChangeAllowed(field: CaseField): boolean {
    return !this.caseFieldService.isReadOnly(field);
  }

  checkYourAnswerFieldsToDisplayExists(): boolean {

    if (!this.eventTrigger.show_summary) {
      return false;
    }

    for (let page of this.wizard.pages) {
      if (this.isShown(page)) {
        for (let field of page.case_fields) {
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

  readOnlySummaryFieldsToDisplayExists(): boolean {
    return this.eventTrigger.case_fields.some(field => field.show_summary_content_option >= 0 );
  }

  showEventNotes(): boolean {
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

  previous() {
    if (this.hasPrevious()) {
      this.navigateToPage(this.getLastPageShown().id);
    }
  }

  hasPrevious(): boolean {
    return !!this.getLastPageShown();
  }

  isShown(page: WizardPage): boolean {
    let fields = this.fieldsUtils
      .mergeCaseFieldsAndFormFields(this.eventTrigger.case_fields, this.editForm.controls['data'].value);
    return page.parsedShowCondition.match(fields);
  }

  canShowFieldInCYA(field: CaseField): boolean {
    return field.show_summary_change_option;
  }

  isSolicitor(): boolean {
    return this.profile.isSolicitor();
  }

  private announceProfile(route: ActivatedRoute): void {
    route.snapshot.pathFromRoot[1].data.profile ?
      this.profileNotifier.announceProfile(route.snapshot.pathFromRoot[1].data.profile)
    : this.profileService.get().subscribe(_ => this.profileNotifier.announceProfile(_));
  }

  private buildConfirmation(response: any): Confirmation {
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

  getCaseId(): String {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  getCancelText(): String {
    if (this.eventTrigger.can_save_draft) {
      return 'Return to case list';
    } else {
      return 'Cancel';
    }
  }
}
