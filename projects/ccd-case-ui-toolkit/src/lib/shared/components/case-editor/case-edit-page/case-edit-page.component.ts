import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { MatLegacyDialog as MatDialog, MatLegacyDialogConfig as MatDialogConfig} from '@angular/material/legacy-dialog';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { CaseEditDataService, CaseEditValidationError } from '../../../commons/case-edit-data';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition';
import { DRAFT_PREFIX } from '../../../domain/draft.model';
import { AddressesService, LoadingService, MultipageComponentStateService } from '../../../services';
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
import { ValidPageListCaseFieldsService } from '../services/valid-page-list-caseFields.service';
import { JourneyInstigator } from '../../../domain/journey';

@Component({
  selector: 'ccd-case-edit-page',
  templateUrl: 'case-edit-page.html',
  styleUrls: ['./case-edit-page.scss']
})
export class CaseEditPageComponent implements OnInit, AfterViewChecked, OnDestroy, JourneyInstigator {
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
  public triggerTextStart = CaseEditPageComponent.TRIGGER_TEXT_START;
  public triggerTextIgnoreWarnings = CaseEditPageComponent.TRIGGER_TEXT_CONTINUE;
  public triggerText: string;
  public formValuesChanged = false;
  public pageChangeSubject: Subject<boolean> = new Subject();
  public caseFields: CaseField[];
  public validationErrors: CaseEditValidationError[] = [];
  public hasPreviousPage$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public callbackErrorsSubject: Subject<any> = new Subject();
  public isLinkedCasesJourneyAtFinalStep: boolean;
  public routeParamsSub: Subscription;
  public caseEditFormSub: Subscription;
  public caseIsLinkedCasesJourneyAtFinalStepSub: Subscription;
  public caseTriggerSubmitEventSub: Subscription;
  public validateSub: Subscription;
  public dialogRefAfterClosedSub: Subscription;
  public saveDraftSub: Subscription;
  public caseFormValidationErrorsSub: Subscription;

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
    public caseEdit: CaseEditComponent,
    private readonly route: ActivatedRoute,
    private readonly formValueService: FormValueService,
    private readonly formErrorService: FormErrorService,
    private readonly cdRef: ChangeDetectorRef,
    private readonly pageValidationService: PageValidationService,
    private readonly dialog: MatDialog,
    private readonly caseFieldService: CaseFieldService,
    private readonly caseEditDataService: CaseEditDataService,
    private readonly loadingService: LoadingService,
    private readonly validPageListCaseFieldsService: ValidPageListCaseFieldsService,
    private readonly multipageComponentStateService: MultipageComponentStateService,
    private readonly addressService: AddressesService
  ) {
    this.multipageComponentStateService.setInstigator(this);
  }

  public onFinalNext(): void {
    this.submit();
  }

  public onFinalPrevious(): void {
    this.cancel();
  }

  public isAtStart(): boolean {
    return this.multipageComponentStateService.isAtStart;
  }

  // This method will be triggered by the next button in the app component
  public nextStep(): void {
    // TODO: Debug why the state isn't persisting. 
    // - Check the AbstractJourneyComponent for more details.
    // - Compare to prototype.
    this.multipageComponentStateService.next();
  }

  // This method will be triggered by the previous button in the app component
  public previousStep(): void {
    this.multipageComponentStateService.previous();
  }

  public ngOnInit(): void {
    initDialog();
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.caseFields = this.getCaseFields();

    this.syncCaseEditDataService();

    this.routeParamsSub = this.route.params
      .subscribe(params => {
        const pageId = params['page'];
        /* istanbul ignore else */
        if (!this.currentPage || pageId !== this.currentPage?.id) {
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
          this.hasPreviousPage$.next(this.caseEdit.hasPrevious(this.currentPage?.id));
        }
        this.triggerText = this.getTriggerText();
      });
    CaseEditPageComponent.setFocusToTop();
    this.caseEditFormSub = this.caseEditDataService.caseEditForm$.subscribe({
      next: editForm => this.editForm = editForm
    });
    this.caseIsLinkedCasesJourneyAtFinalStepSub =
      this.caseEditDataService.caseIsLinkedCasesJourneyAtFinalStep$.subscribe({
        next: isLinkedCasesJourneyAtFinalStep => this.isLinkedCasesJourneyAtFinalStep = isLinkedCasesJourneyAtFinalStep
      });
    this.caseTriggerSubmitEventSub = this.caseEditDataService.caseTriggerSubmitEvent$.subscribe({
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

  public ngOnDestroy(): void {
    this.routeParamsSub?.unsubscribe();
    this.caseEditFormSub?.unsubscribe();
    this.caseIsLinkedCasesJourneyAtFinalStepSub?.unsubscribe();
    this.caseTriggerSubmitEventSub?.unsubscribe();
    this.validateSub?.unsubscribe();
    this.dialogRefAfterClosedSub?.unsubscribe();
    this.saveDraftSub?.unsubscribe();
    this.caseFormValidationErrorsSub?.unsubscribe();
    this.multipageComponentStateService.reset();
  }

  public applyValuesChanged(valuesChanged: boolean): void {
    this.formValuesChanged = valuesChanged;
  }

  public first(): Promise<boolean> {
    return this.caseEdit.first();
  }

  public currentPageIsNotValid(): boolean {
    return !this.pageValidationService.isPageValid(this.currentPage, this.editForm) ||
      (this.isLinkedCasesJourney() && !this.isLinkedCasesJourneyAtFinalStep);
  }

  public isLinkedCasesJourney(): boolean {
    return FieldsUtils.containsLinkedCasesCaseField(this.currentPage.case_fields);
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
    this.previousStep();
    CaseEditPageComponent.setFocusToTop();
  }

  // Adding validation message to show it as Error Summary
  public generateErrorMessage(fields: CaseField[], container?: AbstractControl, path?: string): void {
    const group: AbstractControl = container || this.editForm.controls['data'];
    fields.filter(casefield => !this.caseFieldService.isReadOnly(casefield))
      .filter(casefield => !this.pageValidationService.isHidden(casefield, this.editForm, path))
      .forEach(casefield => {
        const fieldElement = FieldsUtils.isCaseFieldOfType(casefield, ['JudicialUser'])
          ? group.get(`${casefield.id}_judicialUserControl`)
          : group.get(casefield.id);
        if (fieldElement) {
          const label = casefield.label || 'Field';
          let id = casefield.id;
          if (fieldElement['component'] && fieldElement['component'].parent) {
            if (fieldElement['component'].idPrefix.indexOf(`_${id}_`) === -1) {
              id = `${fieldElement['component'].idPrefix}${id}`;
            } else {
              id = `${fieldElement['component'].idPrefix}`;
            }
          }
          if (fieldElement.hasError('required')) {
            if (casefield.id === 'AddressLine1') {
              // EUI-1067 - Display more relevant error message to user and correctly navigate to the field
              this.addressService.setMandatoryError(true);
              this.caseEditDataService.addFormValidationError({ id: `${path}_${path}`, message: `An address is required` });
            } else {
              this.caseEditDataService.addFormValidationError({ id, message: `%FIELDLABEL% is required`, label });
            }
            fieldElement.markAsDirty();
            // For the JudicialUser field type, an error needs to be set on the component so that an error message
            // can be displayed at field level
            if (FieldsUtils.isCaseFieldOfType(casefield, ['JudicialUser'])) {
              fieldElement['component'].errors = { required: true };
            }
          } else if (fieldElement.hasError('pattern')) {
            this.caseEditDataService.addFormValidationError({ id, message: `%FIELDLABEL% is not valid`, label });
            fieldElement.markAsDirty();
          } else if (fieldElement.hasError('minlength')) {
            this.caseEditDataService.addFormValidationError({ id, message: `%FIELDLABEL% is below the minimum length`, label });
            fieldElement.markAsDirty();
          } else if (fieldElement.hasError('maxlength')) {
            this.caseEditDataService.addFormValidationError({ id, message: `%FIELDLABEL% exceeds the maximum length`, label });
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
            } else if (FieldsUtils.isCaseFieldOfType(casefield, ['FlagLauncher'])) {
              this.validationErrors.push({
                id,
                message: FieldsUtils.getValidationErrorMessageForFlagLauncherCaseField(casefield)
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
    /* istanbul ignore else */
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      /* istanbul ignore else */
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }

  public submit(): void {
    this.caseEditDataService.clearFormValidationErrors();
    console.log('Page submit event fired!')
    if (this.currentPageIsNotValid()) {
      // The generateErrorMessage method filters out the hidden fields.
      // The error message for LinkedCases journey will never get displayed because the
      // LinkedCases is configured with ComponentLauncher field as visible and caseLinks field as hidden.
      if (this.isLinkedCasesJourney()) {
        this.validationErrors.push({ id: 'next-button', message: 'Please select Next to go to the next page' });
        CaseEditPageComponent.scrollToTop();
      } else {
        this.generateErrorMessage(this.currentPage.case_fields);
      }
    }

    if (!this.caseEdit.isSubmitting && !this.currentPageIsNotValid()) {
      this.addressService.setMandatoryError(false);
      console.log('Case Edit Error', this.caseEdit.error);
      if (this.caseEdit.validPageList.findIndex(page=> page.id === this.currentPage.id) === -1) {
        this.caseEdit.validPageList.push(this.currentPage);
      }
      this.caseEdit.isSubmitting = true;
      this.caseEdit.error = null;
      const caseEventData: CaseEventData = this.buildCaseEventData();
      const loadingSpinnerToken = this.loadingService.register();
      this.validateSub = this.caseEdit.validate(caseEventData, this.currentPage.id)
        .pipe(
          finalize(() => {
            this.loadingService.unregister(loadingSpinnerToken);
          })
        )
        .subscribe((jsonData) => {
          /* istanbul ignore else */
          if (jsonData) {
            this.updateFormData(jsonData as CaseEventData);
          }
          this.saveDraft();
          this.next();
        }, error => {
          this.handleError(error);
        });
      CaseEditPageComponent.scrollToTop();
      // Remove all JudicialUser FormControls with the ID suffix "_judicialUserControl" because these are not
      // intended to be present in the Case Event data (they are added only for value selection and validation
      // purposes)
      this.removeAllJudicialUserFormControls(this.currentPage, this.editForm);
    }
    CaseEditPageComponent.setFocusToTop();
  }

  public updateFormData(jsonData: CaseEventData): void {
    for (const caseFieldId of Object.keys(jsonData.data)) {
      /* istanbul ignore else */
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
    /* istanbul ignore else */
    if (eventTrigger?.case_fields) {
      eventTrigger.case_fields
        .filter(element => element.id === caseFieldId)
        .forEach(element => {
          if (this.isAnObject(element.value)) {
            const updatedJsonDataObject = this.updateJsonDataObject(caseFieldId, jsonData, element);

            element.value = {
              ...element.value,
              ...updatedJsonDataObject,
            };
          } else {
            element.value = jsonData.data[caseFieldId];
          }
        });
    }
  }

  private updateJsonDataObject(caseFieldId: string, jsonData: CaseEventData, element: CaseField): Record<string, unknown> {
    return Object.keys(jsonData.data[caseFieldId]).reduce((acc, key) => {
      const elementValue = element.value[key];
      const jsonDataValue = jsonData.data[caseFieldId][key];
      const hasElementGotValueProperty = this.isAnObject(elementValue) && elementValue.value !== undefined;
      const jsonDataOrElementValue = jsonDataValue?.value !== null && jsonDataValue?.value !== undefined ? jsonDataValue : elementValue;

      return {
        ...acc,
        [`${key}`]: hasElementGotValueProperty ? jsonDataOrElementValue : jsonDataValue
      };
    }, {});
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
    this.caseEdit.ignoreWarning = errorContext.ignoreWarning;
    this.triggerText = errorContext.triggerText;
  }

  public next(): Promise<boolean> {
    if (this.canNavigateToSummaryPage()) {
      this.caseEdit.isSubmitting = false;
    }
    this.resetErrors();
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
        this.dialogRefAfterClosedSub = dialogRef.afterClosed().subscribe(result => {
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

    this.caseEditDataService.clearFormValidationErrors();
    this.multipageComponentStateService.reset();
  }

  public submitting(): boolean {
    return this.caseEdit.isSubmitting;
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

  private canNavigateToSummaryPage(): boolean {
    const nextPage = this.caseEdit.getNextPage({
      currentPageId: this.currentPage?.id,
      wizard: this.wizard,
      eventTrigger: this.eventTrigger,
      form: this.editForm
    });

    return this.eventTrigger.show_summary || !!nextPage;
  }

  private getTriggerText(): string {
    const textBasedOnCanSaveDraft = this.eventTrigger && this.eventTrigger.can_save_draft
      ? CaseEditPageComponent.TRIGGER_TEXT_SAVE
      : CaseEditPageComponent.TRIGGER_TEXT_START;

    return this.canNavigateToSummaryPage()
      ? textBasedOnCanSaveDraft
      : 'Submit';
  }

  private discard(): void {
    if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
      this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.RESUMED_FORM_DISCARD });
    } else {
      this.caseEdit.cancelled.emit({ status: CaseEditPageComponent.NEW_FORM_DISCARD });
    }
  }

  private handleError(error) {
    this.caseEdit.isSubmitting = false;
    this.caseEdit.error = error;
    this.caseEdit.callbackErrorsSubject.next(this.caseEdit.error);
    this.callbackErrorsSubject.next(this.caseEdit.error);
    /* istanbul ignore else */
    if (this.caseEdit.error.details) {
      this.formErrorService
        .mapFieldErrors(this.caseEdit.error.details.field_errors, this.editForm?.controls?.['data'] as FormGroup, 'validation');
    }
    console.log('handleError ', error);
  }

  private resetErrors(): void {
    this.caseEdit.error = null;
    this.caseEdit.ignoreWarning = false;
    this.triggerText = this.getTriggerText();
    this.caseEdit.callbackErrorsSubject.next(null);
  }

  private saveDraft() {
    if (this.eventTrigger.can_save_draft) {
      const draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
      draftCaseEventData.event_token = this.eventTrigger.event_token;
      draftCaseEventData.ignore_warning = this.caseEdit.ignoreWarning;
      this.saveDraftSub = this.caseEdit.saveDraft(draftCaseEventData).subscribe(
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

  public buildCaseEventData(fromPreviousPage?: boolean): CaseEventData {
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
    pageEventData.ignore_warning = this.caseEdit.ignoreWarning;

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

    // delete fields which are not part of the case event journey wizard pages case fields
    this.validPageListCaseFieldsService.deleteNonValidatedFields(this.caseEdit.validPageList, caseEventData.data, this.eventTrigger.case_fields, fromPreviousPage, this.editForm.controls['data'].value);

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
    this.caseFormValidationErrorsSub = this.caseEditDataService.caseFormValidationErrors$.subscribe({
      next: (validationErrors) => this.validationErrors = validationErrors
    });
  }

  public getRpxTranslatePipeArgs(fieldLabel: string): { FIELDLABEL: string } | null {
    return fieldLabel ? ({ FIELDLABEL: fieldLabel }) : null;
  }

  public onEventCanBeCompleted(eventCanBeCompleted: boolean): void {
    this.caseEdit.onEventCanBeCompleted({
      eventTrigger: this.eventTrigger,
      eventCanBeCompleted,
      caseDetails: this.caseEdit.caseDetails,
      form: this.editForm,
      submit: this.caseEdit.submit,
    });
  }

  private removeAllJudicialUserFormControls(page: WizardPage, editForm: FormGroup): void {
    page.case_fields.forEach(caseField => {
      if (FieldsUtils.isCaseFieldOfType(caseField, ['JudicialUser'])) {
        (editForm.controls['data'] as FormGroup).removeControl(`${caseField.id}_judicialUserControl`);
      }
    });
  }
}
