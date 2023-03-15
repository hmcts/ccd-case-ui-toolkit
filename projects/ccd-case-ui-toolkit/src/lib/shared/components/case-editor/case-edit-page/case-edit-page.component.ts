import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition';
import { DRAFT_PREFIX } from '../../../domain/draft.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { FieldsUtils } from '../../../services/fields';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FormValueService } from '../../../services/form/form-value.service';
import { SaveOrDiscardDialogComponent } from '../../dialogs/save-or-discard-dialog';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { initDialog } from '../../helpers';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { WizardPage } from '../domain/wizard-page.model';
import { Wizard } from '../domain/wizard.model';
import { PageValidationService } from '../services/page-validation.service';

@Component({
  selector: 'ccd-case-edit-page',
  templateUrl: 'case-edit-page.html',
  styleUrls: ['./case-edit-page.scss']
})
export class CaseEditPageComponent implements OnInit, AfterViewChecked {

  public static readonly RESUMED_FORM_DISCARD = 'RESUMED_FORM_DISCARD';
  public static readonly NEW_FORM_DISCARD = 'NEW_FORM_DISCARD';
  public static readonly NEW_FORM_SAVE = 'NEW_FORM_CHANGED_SAVE';
  public static readonly RESUMED_FORM_SAVE = 'RESUMED_FORM_SAVE';
  public static readonly TRIGGER_TEXT_START = 'Continue';
  public static readonly TRIGGER_TEXT_SAVE = 'Save and continue';
  public static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Continue';

  public eventTrigger: CaseEventTrigger;
  public editForm: FormGroup;
  public wizard: Wizard;
  public currentPage: WizardPage;
  public dialogConfig: MatDialogConfig;
  public error: HttpError;
  public callbackErrorsSubject: Subject<any> = new Subject();
  public ignoreWarning = false;
  public triggerTextStart = CaseEditPageComponent.TRIGGER_TEXT_START;
  public triggerTextIgnoreWarnings = CaseEditPageComponent.TRIGGER_TEXT_CONTINUE;
  public triggerText: string;
  public isSubmitting = false;
  public formValuesChanged = false;
  public pageChangeSubject: Subject<boolean> = new Subject();
  public caseFields: CaseField[];
  public validationErrors: { id: string, message: string }[] = [];
  public showSpinner: boolean;
  public hasPreviousPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private static scrollToTop(): void {
    window.scrollTo(0, 0);
  }

  private static setFocusToTop() {
    const topContainer = document.getElementById('top');
    if (topContainer) {
      topContainer.focus();
    }
  }

  constructor(
    private readonly caseEdit: CaseEditComponent,
    private readonly route: ActivatedRoute,
    private readonly formValueService: FormValueService,
    private readonly formErrorService: FormErrorService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly pageValidationService: PageValidationService,
    private readonly dialog: MatDialog,
    private readonly caseFieldService: CaseFieldService,
    private readonly caseEditDataService: CaseEditDataService
  ) { }

  public ngOnInit(): void {
    initDialog();
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.caseFields = this.getCaseFields();
    this.triggerText = this.getTriggerText();

    this.syncCaseEditDataService();

    this.route.params
      .subscribe(params => {
        const pageId = params['page'];
        if (!this.currentPage || pageId !== this.currentPage.id) {
          const page = this.caseEdit.getPage(pageId);
          if (page) {
            this.currentPage = page;
          } else {
            if (this.currentPage) {
              return this.next();
            } else {
              return this.first();
            }
          }
          this.hasPreviousPage$.next(this.caseEdit.hasPrevious(this.currentPage.id));
        }
      });
    CaseEditPageComponent.setFocusToTop();
    this.caseEditDataService.caseEditForm$.subscribe({
      next: editForm => this.editForm = editForm
    });
    this.caseEditDataService.caseTriggerSubmitEvent$.subscribe({
      next: state => {
        if (state) {
          this.caseEditDataService.setTriggerSubmitEvent(false);
          this.submit();
        }
      }
    });
  }

  public ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  public applyValuesChanged(valuesChanged: boolean): void {
    this.formValuesChanged = valuesChanged;
  }

  public first(): Promise<boolean> {
    return this.caseEdit.first();
  }

  public currentPageIsNotValid(): boolean {
    return !this.pageValidationService.isPageValid(this.currentPage, this.editForm);
  }

  /**
   * caseEventData.event_data contains all the values from the previous pages so we set caseEventData.data = caseEventData.event_data
   * This builds the form with data from the previous pages
   * EUI-3732 - Breathing space data not persisted on Previous button click with ExpUI Demo
   */
  public toPreviousPage(): void {
    this.caseEditDataService.clearFormValidationErrors();

    const caseEventData: CaseEventData = this.buildCaseEventData(true);
    caseEventData.data = caseEventData.event_data;
    this.updateFormData(caseEventData);
    this.previous();
    CaseEditPageComponent.setFocusToTop();
  }

  // Adding validation message to show it as Error Summary
  public generateErrorMessage(fields: CaseField[], container?: AbstractControl, path?: string): void {
    const group: AbstractControl = container || this.editForm.controls['data'];
    fields.filter(casefield => !this.caseFieldService.isReadOnly(casefield))
      .filter(casefield => !this.pageValidationService.isHidden(casefield, this.editForm, path))
      .forEach(casefield => {
        const fieldElement = group.get(casefield.id);
        if (fieldElement) {
          const label = casefield.label || 'Field';
          let id = casefield.id;
          if (fieldElement['component'] && fieldElement['component'].parent) {
            if (fieldElement['component'].idPrefix.indexOf('_' + id + '_') === -1) {
              id = `${fieldElement['component'].idPrefix}${id}`;
            } else {
              id = `${fieldElement['component'].idPrefix}`;
            }
          }
          if (fieldElement.hasError('required')) {
            this.caseEditDataService.addFormValidationError({ id, message: `${label} is required` });
            fieldElement.markAsDirty();
          } else if (fieldElement.hasError('pattern')) {
            this.caseEditDataService.addFormValidationError({ id, message: `${label} is not valid` });
            fieldElement.markAsDirty();
          } else if (fieldElement.hasError('minlength')) {
            this.caseEditDataService.addFormValidationError({ id, message: `${label} is below the minimum length` });
            fieldElement.markAsDirty();
          } else if (fieldElement.hasError('maxlength')) {
            this.caseEditDataService.addFormValidationError({ id, message: `${label} exceeds the maximum length` });
            fieldElement.markAsDirty();
          } else if (fieldElement.invalid) {
            if (casefield.isComplex()) {
              this.generateErrorMessage(casefield.field_type.complex_fields, fieldElement, id);
            } else if (casefield.isCollection() && casefield.field_type.collection_field_type.type === 'Complex') {
              const fieldArray = fieldElement as FormArray;
              if (fieldArray['component'] && fieldArray['component']['collItems'] && fieldArray['component']['collItems'].length > 0) {
                id = `${fieldArray['component']['collItems'][0].prefix}`;
              }
              fieldArray.controls.forEach((c: AbstractControl) => {
                this.generateErrorMessage(casefield.field_type.collection_field_type.complex_fields, c.get('value'), id);
              });
            } else if (FieldsUtils.isFlagLauncherCaseField(casefield)) {
              // Check whether the case field DisplayContextParameter is signalling "create" mode or "update" mode
              // (expected always to be one of the two), to set the correct error message
              let action = '';
              if (casefield.display_context_parameter === '#ARGUMENT(CREATE)') {
                action = 'creation';
              } else if (casefield.display_context_parameter === '#ARGUMENT(UPDATE)') {
                action = 'update';
              }
              this.validationErrors.push({
                id,
                message: `Please select Next to complete the ${action} of the ${action === 'update' ? 'selected ' : ''}case flag`
              });
            } else {
              this.validationErrors.push({ id, message: `Select or fill the required ${casefield.label} field` });
              fieldElement.markAsDirty();
            }
          }
        }
      });
    CaseEditPageComponent.scrollToTop();
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  public submit(): void {
    this.caseEditDataService.clearFormValidationErrors();

    if (this.currentPageIsNotValid()) {
      this.generateErrorMessage(this.currentPage.case_fields);
    }
    if (!this.isSubmitting && !this.currentPageIsNotValid()) {
      this.isSubmitting = true;
      this.error = null;
      const caseEventData: CaseEventData = this.buildCaseEventData();
      this.showSpinner = true;
      this.caseEdit.validate(caseEventData, this.currentPage.id)
        .subscribe((jsonData) => {
          if (jsonData) {
            this.updateFormData(jsonData as CaseEventData);
          }
          this.saveDraft();
          this.showSpinner = false;
          this.next();
        }, error => {
          this.showSpinner = false;
          this.handleError(error);
        });
      CaseEditPageComponent.scrollToTop();
    }
    CaseEditPageComponent.setFocusToTop();
  }

  public updateFormData(jsonData: CaseEventData): void {
    for (const caseFieldId of Object.keys(jsonData.data)) {
        if (this.pageWithFieldExists(caseFieldId)) {
          this.updateEventTriggerCaseFields(caseFieldId, jsonData, this.caseEdit.eventTrigger);
          this.updateFormControlsValue(this.editForm, caseFieldId, jsonData.data[caseFieldId]);
        }
      }
  }

  // we do the check, becasue the data comes from the external source
  public pageWithFieldExists(caseFieldId: string) {
    return this.wizard.findWizardPage(caseFieldId);
  }

  public updateEventTriggerCaseFields(caseFieldId: string, jsonData: CaseEventData, eventTrigger: CaseEventTrigger) {
    if (eventTrigger?.case_fields) {
      eventTrigger.case_fields
        .filter(element => element.id === caseFieldId)
        .forEach(element => {
          if(this.isAnObject(element.value)) {
            const updatedJsonDataObject = this.updateJsonDataObject(caseFieldId, jsonData, element);

            element.value = {
              ...element.value,
              ...updatedJsonDataObject,
            };
          }
          else {
            element.value = jsonData.data[caseFieldId];
          }
        });
    }
  }

  private updateJsonDataObject(caseFieldId: string, jsonData: CaseEventData, element: CaseField) : Record<string, unknown> {
    return Object.keys(jsonData.data[caseFieldId]).reduce((acc, key) => {
      const elementValue = element.value[key];
      const jsonDataValue = jsonData.data[caseFieldId][key];
      const hasElementGotValueProperty = this.isAnObject(elementValue) && elementValue.value !== undefined;
      const jsonDataOrElementValue = jsonDataValue?.value !== null && jsonDataValue?.value !== undefined ? jsonDataValue : elementValue;

      return {
        ...acc,
        [`${key}`]: hasElementGotValueProperty ? jsonDataOrElementValue : jsonDataValue
      };
    },{});
  }

  private isAnObject(property: unknown): boolean {
    return typeof property === 'object' && !Array.isArray(property) && property !== null;
  }

  public updateFormControlsValue(formGroup: FormGroup, caseFieldId: string, value: any): void {
    const theControl = formGroup.controls['data'].get(caseFieldId);
    if (theControl && theControl['status'] !== 'DISABLED') {
      if (Array.isArray(theControl.value) && Array.isArray(value)
              && theControl.value.length > value.length && theControl['caseField']
              && theControl['caseField']['display_context'] && theControl['caseField']['display_context'] === 'OPTIONAL'
              && theControl['caseField']['field_type'] && theControl['caseField']['field_type']['type'] === 'Collection') {
        // do nothing
      } else {
        theControl.patchValue(value);
      }
    }
  }

  public callbackErrorsNotify(errorContext: CallbackErrorsContext) {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  public next(): Promise<boolean> {
    this.resetErrors();
    this.isSubmitting = false;
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.next(this.currentPage.id);
  }

  public previous(): Promise<boolean> {
    this.resetErrors();
    this.saveDraft();
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.previous(this.currentPage.id);
  }

  public hasPrevious(): boolean {
    return this.caseEdit.hasPrevious(this.currentPage.id);
  }

  public cancel(): void {
    if (this.eventTrigger.can_save_draft) {
      if (this.formValuesChanged) {
        const dialogRef = this.dialog.open(SaveOrDiscardDialogComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'Discard') {
            this.discard();
          } else if (result === 'Save') {
            const draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
            if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
              this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.RESUMED_FORM_SAVE, data: draftCaseEventData });
            } else {
              this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.NEW_FORM_SAVE, data: draftCaseEventData });
            }
          }
        });
      } else {
        this.discard();
      }
    } else {
      this.caseEdit.cancelled.emit();
    }
  }

  public submitting(): boolean {
    return this.isSubmitting;
  }

  public getCaseId(): string {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  public getCaseTitle(): string {
    return (this.caseEdit.caseDetails && this.caseEdit.caseDetails.state &&
      this.caseEdit.caseDetails.state.title_display ? this.caseEdit.caseDetails.state.title_display : '');
  }

  public getCancelText(): string {
    return this.eventTrigger.can_save_draft ? 'Return to case list' : 'Cancel';
  }

  private getTriggerText(): string {
    return this.eventTrigger && this.eventTrigger.can_save_draft
      ? CaseEditPageComponent.TRIGGER_TEXT_SAVE
      : CaseEditPageComponent.TRIGGER_TEXT_START;
  }

  private discard(): void {
    if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
      this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.RESUMED_FORM_DISCARD });
    } else {
      this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.NEW_FORM_DISCARD });
    }
  }

  private handleError(error) {
    this.isSubmitting = false;
    this.error = error;
    this.callbackErrorsSubject.next(this.error);
    if (this.error.details) {
      this.formErrorService
        .mapFieldErrors(this.error.details.field_errors, this.editForm.controls['data'] as FormGroup, 'validation');
    }
  }

  private resetErrors(): void {
    this.error = null;
    this.ignoreWarning = false;
    this.triggerText = this.getTriggerText();
    this.callbackErrorsSubject.next(null);
  }

  private saveDraft() {
    if (this.eventTrigger.can_save_draft) {
      const draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
      draftCaseEventData.event_token = this.eventTrigger.event_token;
      draftCaseEventData.ignore_warning = this.ignoreWarning;
      this.caseEdit.saveDraft(draftCaseEventData).subscribe(
        (draft) => this.eventTrigger.case_id = DRAFT_PREFIX + draft.id, error => this.handleError(error)
      );
    }
  }

  private getCaseFields(): CaseField[] {
    if (this.caseEdit.caseDetails) {
      return FieldsUtils.getCaseFields(this.caseEdit.caseDetails);
    }

    return this.eventTrigger.case_fields;
  }

  private getCaseFieldsFromCurrentAndPreviousPages(): CaseField[] {
    const result: CaseField[] = [];
    this.wizard.pages.forEach(page => {
      if (page.order <= this.currentPage.order) {
        page.case_fields.forEach(field => result.push(field));
      }
    });
    return result;
  }

  private buildCaseEventData(fromPreviousPage?: boolean): CaseEventData {
    const formValue: object = this.editForm.value;

    // Get the CaseEventData for the current page.
    const pageFields: CaseField[] = this.currentPage.case_fields;
    const pageEventData: CaseEventData = this.getFilteredCaseEventData(pageFields, formValue, true);

    // Get the CaseEventData for the entire form (all pages).
    const allCaseFields = this.getCaseFieldsFromCurrentAndPreviousPages();
    const formEventData: CaseEventData = this.getFilteredCaseEventData(allCaseFields, formValue, false, true, fromPreviousPage);

    // Now here's the key thing - the pageEventData has a property called `event_data` and
    // we need THAT to be the value of the entire form: `formEventData.data`.
    pageEventData.event_data = formEventData.data;

    // Finalise the CaseEventData object.
    pageEventData.event_token = this.eventTrigger.event_token;
    pageEventData.ignore_warning = this.ignoreWarning;

    // Finally, try to set up the case_reference.
    if (this.caseEdit.caseDetails) {
      pageEventData.case_reference = this.caseEdit.caseDetails.case_id;
    }

    // Return the now hopefully sane CaseEventData.
    return pageEventData;
  }

  /**
   * Abstracted this method from buildCaseEventData to remove duplication.
   * @param caseFields The fields to filter the data by.
   * @param formValue The original value of the form.
   * @param clearEmpty Whether or not to clear out empty values.
   * @param clearNonCase Whether or not to clear out fields that are not part of the case.
   * @returns CaseEventData for the specified parameters.
   */
  private getFilteredCaseEventData(caseFields: CaseField[], formValue: object, clearEmpty = false,
    clearNonCase = false, fromPreviousPage = false): CaseEventData {
    // Get the data for the fields specified.
    const formFields = this.formValueService.filterCurrentPageFields(caseFields, formValue);

    // Sort out the dynamic lists.
    this.formValueService.sanitiseDynamicLists(caseFields, formFields);

    // Get hold of the CaseEventData.
    const caseEventData: CaseEventData = this.formValueService.sanitise(formFields) as CaseEventData;

    // Tidy it up before we return it.
    this.formValueService.removeUnnecessaryFields(caseEventData.data, caseFields, clearEmpty, clearNonCase,
      fromPreviousPage, this.currentPage.case_fields);

    return caseEventData;
  }

  private syncCaseEditDataService(): void {
    this.caseEditDataService.setCaseDetails(this.caseEdit.caseDetails);
    this.caseEditDataService.setCaseEventTriggerName(this.eventTrigger.name);
    this.caseEditDataService.setCaseTitle(this.getCaseTitle());
    this.caseEditDataService.setCaseEditForm(this.editForm);
    this.caseEditDataService.caseFormValidationErrors$.subscribe({
      next: (validationErrors) => this.validationErrors = validationErrors
    });
  }
}
