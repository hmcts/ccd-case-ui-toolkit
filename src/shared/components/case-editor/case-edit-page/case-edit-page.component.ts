import { AfterViewChecked, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { HttpError } from '../../../domain/http/http-error.model';
import { FormValueService } from '../../../services/form/form-value.service';
import { PageValidationService } from '../services/page-validation.service';
import { SaveOrDiscardDialogComponent } from '../../dialogs/save-or-discard-dialog';
import { WizardPage } from '../domain/wizard-page.model';
import { FormErrorService } from '../../../services/form/form-error.service';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { DRAFT_PREFIX } from '../../../domain/draft.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields';
import { DataRowOutlet } from '@angular/cdk/table';
import { tsStructureIsReused } from '@angular/compiler-cli/src/transformers/util';

@Component({
  selector: 'ccd-case-edit-page',
  templateUrl: 'case-edit-page.html',
  styleUrls: ['./case-edit-page.scss']
})
export class CaseEditPageComponent implements OnInit, AfterViewChecked {

  static readonly RESUMED_FORM_DISCARD = 'RESUMED_FORM_DISCARD';
  static readonly NEW_FORM_DISCARD = 'NEW_FORM_DISCARD';
  static readonly NEW_FORM_SAVE = 'NEW_FORM_CHANGED_SAVE';
  static readonly RESUMED_FORM_SAVE = 'RESUMED_FORM_SAVE';
  static readonly TRIGGER_TEXT_START = 'Continue';
  static readonly TRIGGER_TEXT_SAVE = 'Save and continue';
  static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Continue';

  eventTrigger: CaseEventTrigger;
  editForm: FormGroup;
  wizard: Wizard;
  currentPage: WizardPage;
  dialogConfig: MatDialogConfig;
  error: HttpError;
  callbackErrorsSubject: Subject<any> = new Subject();
  ignoreWarning = false;
  triggerTextStart = CaseEditPageComponent.TRIGGER_TEXT_START;
  triggerTextIgnoreWarnings = CaseEditPageComponent.TRIGGER_TEXT_CONTINUE;
  triggerText: string;
  isSubmitting = false;
  formValuesChanged = false;
  pageChangeSubject: Subject<boolean> = new Subject();
  caseFields: CaseField[];

  constructor(
    private caseEdit: CaseEditComponent,
    private route: ActivatedRoute,
    private formValueService: FormValueService,
    private formErrorService: FormErrorService,
    private cdRef: ChangeDetectorRef,
    private pageValidationService: PageValidationService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.initDialog();
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.caseFields = this.getCaseFields();
    this.triggerText = this.getTriggerText();

    this.route.params.subscribe(params => {
      let pageId = params['page'];
      if (!this.currentPage || pageId !== this.currentPage.id) {
        let page = this.caseEdit.getPage(pageId);
        if (page) {
          this.currentPage = page;
        } else {
          if (this.currentPage) {
            return this.next();
          } else {
            return this.first();
          }
        }
      }
    });
    this.setFocusToTop();
  }

  ngAfterViewChecked(): void {
    this.cdRef.detectChanges();
  }

  applyValuesChanged(valuesChanged: boolean): void {
    this.formValuesChanged = valuesChanged;
    this.currentPageIsNotValid();
  }

  private initDialog() {
    this.dialogConfig = new MatDialogConfig();
    this.dialogConfig.disableClose = true;
    this.dialogConfig.autoFocus = true;
    this.dialogConfig.ariaLabel = 'Label';
    this.dialogConfig.height = '245px';
    this.dialogConfig.width = '550px';
    this.dialogConfig.panelClass = 'dialog';

    this.dialogConfig.closeOnNavigation = false;
    this.dialogConfig.position = {
      top: window.innerHeight / 2 - 120 + 'px', left: window.innerWidth / 2 - 275 + 'px'
    }
  }

  first(): Promise<boolean> {
    return this.caseEdit.first();
  }

  currentPageIsNotValid(): boolean {
    const data = this.editForm.controls.data['controls'];
    if (data) {
      if (this.currentPage.id === 'editAppealnewMatters') {
        if (data.newMatters && data.hasNewMatters) {
          const newMatters = data.newMatters.value ? data.newMatters.value : '';
          const hasNewMatters = data.hasNewMatters.value ? data.hasNewMatters.value : '';
          if (newMatters.length === 0 && hasNewMatters === 'Yes') {
            return true;
          }
        }
      } else {
        if (data.email && data.mobileNumber) {
          const email = data.email.value ? data.email.value : '';
          const mobileNumber = data.mobileNumber.value ? data.mobileNumber.value : '';
          if (email.length === 0 && mobileNumber.length === 0) {
            return true;
          }
          if (email.length !== 0 && mobileNumber.length === 0) {
            return false;
          }
          if (email.length === 0 && mobileNumber.length !== 0) {
            return false;
          }
        }
      }
    }
   return !this.pageValidationService.isPageValid(this.currentPage, this.editForm);
  }

  toPreviousPage() {
    let caseEventData: CaseEventData = this.buildCaseEventData();
    this.updateFormData(caseEventData);
    this.previous();
    this.setFocusToTop();
  }

  submit() {
    if (!this.isSubmitting) {
      this.isSubmitting = true;
      this.error = null;
      let caseEventData: CaseEventData = this.buildCaseEventData();
      this.caseEdit.validate(caseEventData, this.currentPage.id)
        .subscribe((jsonData) => {
          if (jsonData) {
            this.updateFormData(jsonData as CaseEventData);
          }
          this.saveDraft();
          this.next();
        }, error => this.handleError(error));
      this.scrollToTop();
    }
    this.setFocusToTop();
  }

  updateFormData(jsonData: CaseEventData): void {
    for (const caseFieldId of Object.keys(jsonData.data)) {
      if (this.pageWithFieldExists(caseFieldId)) {
        this.updateEventTriggerCaseFields(caseFieldId, jsonData, this.caseEdit.eventTrigger);
        this.updateFormControlsValue(this.editForm, caseFieldId, jsonData.data[caseFieldId]);
      }
    }
  }

  // we do the check, becasue the data comes from the external source
  pageWithFieldExists(caseFieldId) {
    return this.wizard.findWizardPage(caseFieldId);
  }

  updateEventTriggerCaseFields(caseFieldId: string, jsonData: CaseEventData, eventTrigger: CaseEventTrigger) {
    if (eventTrigger.case_fields) {
      eventTrigger.case_fields
        .filter(element => element.id === caseFieldId)
        .forEach(element => element.value = jsonData.data[caseFieldId]);
    }
  }

  updateFormControlsValue(formGroup: FormGroup, caseFieldId: string, value: any): void {
    let theControl = formGroup.controls['data'].get(caseFieldId);
    if (theControl) {
      theControl.patchValue(value);
    }
  }

  callbackErrorsNotify(errorContext: CallbackErrorsContext) {
    this.ignoreWarning = errorContext.ignore_warning;
    this.triggerText = errorContext.trigger_text;
  }

  next(): Promise<boolean> {
    this.resetErrors();
    this.isSubmitting = false;
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.next(this.currentPage.id);
  }

  previous(): Promise<boolean> {
    this.resetErrors();
    this.saveDraft();
    this.formValuesChanged = false;
    this.pageChangeSubject.next(true);
    return this.caseEdit.previous(this.currentPage.id);
  }

  hasPrevious(): boolean {
    return this.caseEdit.hasPrevious(this.currentPage.id);
  }

  cancel(): void {
    if (this.eventTrigger.can_save_draft) {
      if (this.formValuesChanged) {
        const dialogRef = this.dialog.open(SaveOrDiscardDialogComponent, this.dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
          if (result === 'Discard') {
            this.discard();
          } else if (result === 'Save') {
            const draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
            if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
              this.caseEdit.cancelled.emit({status: CaseEditPageComponent.RESUMED_FORM_SAVE, data: draftCaseEventData});
            } else {
              this.caseEdit.cancelled.emit({status: CaseEditPageComponent.NEW_FORM_SAVE, data: draftCaseEventData});
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

  private discard() {
    if (this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM) === 'viewDraft') {
      this.caseEdit.cancelled.emit({status: CaseEditPageComponent.RESUMED_FORM_DISCARD});
    } else {
      this.caseEdit.cancelled.emit({status: CaseEditPageComponent.NEW_FORM_DISCARD});
    }
  }

  submitting(): boolean {
    return this.isSubmitting;
  }

  private scrollToTop(): void {
    window.scrollTo(0, 0);
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

  getCaseId(): String {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  private saveDraft() {
    if (this.eventTrigger.can_save_draft) {
      let draftCaseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
      draftCaseEventData.event_token = this.eventTrigger.event_token;
      draftCaseEventData.ignore_warning = this.ignoreWarning;
      this.caseEdit.saveDraft(draftCaseEventData).subscribe(
        (draft) => this.eventTrigger.case_id = DRAFT_PREFIX + draft.id, error => this.handleError(error)
      );
    }
  }

  getCancelText(): String {
    if (this.eventTrigger.can_save_draft) {
      return 'Return to case list';
    } else {
      return 'Cancel';
    }
  }

  getTriggerText(): string {
    if (this.eventTrigger && this.eventTrigger.can_save_draft) {
      return CaseEditPageComponent.TRIGGER_TEXT_SAVE;
    } else {
      return CaseEditPageComponent.TRIGGER_TEXT_START;
    }
  }

  private getCaseFields(): CaseField[] {
    if (this.caseEdit.caseDetails) {
      return FieldsUtils.getCaseFields(this.caseEdit.caseDetails);
    }

    return this.eventTrigger.case_fields;
  }

  private getCaseFieldsFromCurrentAndPreviousPages(): CaseField[] {
    const result: CaseField[] = []
    this.wizard.pages.forEach ( page => {
      if (page.order <= this.currentPage.order) {
        page.case_fields.forEach( field => result.push(field));
      }
    })
    return result;
  }

  private buildCaseEventData(): CaseEventData {
    // Get hold of the fields specific to the current page that we're going to submit.
    const pageFormFields = this.formValueService.filterCurrentPageFields(this.currentPage.case_fields, this.editForm.value);

    // Sort out the dynamic lists.
    this.formValueService.sanitiseDynamicLists(this.currentPage.case_fields, pageFormFields);

    // Get hold of the CaseEventData and immediately tidy it up.
    const caseEventData: CaseEventData = this.formValueService.sanitise(pageFormFields) as CaseEventData;
    this.formValueService.removeUnnecessaryFields(caseEventData.data, this.currentPage.case_fields, true);

    // Now add the remaining bits and pieces to the CaseEventData,
    // The event_data should be the full context of the event, including values from previous pages, but not labels

    caseEventData.event_data = this.clone(this.editForm.value.data);
    let evCf = this.getCaseFieldsFromCurrentAndPreviousPages();
    this.formValueService.removeUnnecessaryFields(caseEventData.event_data, evCf,
      false, true);
    // we are not calling santise on event_data to be consistent with previous code. Seeems like we ought to though
    caseEventData.event_token = this.eventTrigger.event_token;
    caseEventData.ignore_warning = this.ignoreWarning;

    // Finally, try to set up the case_reference.
    if (this.caseEdit.caseDetails) {
      caseEventData.case_reference = this.caseEdit.caseDetails.case_id;
    }

    // Return the now hopefully sane CaseEventData.
    return caseEventData;
  }

  private clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  private setFocusToTop() {
    const topContainer = document.getElementById('top');
    if (topContainer) {
      topContainer.focus();
    }
  }
}
