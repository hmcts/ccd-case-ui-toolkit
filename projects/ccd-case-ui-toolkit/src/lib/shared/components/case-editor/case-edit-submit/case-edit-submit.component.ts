import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CaseEventTrigger, CaseField, Profile } from '../../../domain';
import { Task } from '../../../domain/work-allocation/Task';
import {
  CaseFieldService,
  FieldsUtils,
  OrderService,
  ProfileNotifier,
} from '../../../services';
import { CallbackErrorsComponent, CallbackErrorsContext } from '../../error';
import { PaletteContext } from '../../palette';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';

// @dynamic
@Component({
  selector: 'ccd-case-edit-submit',
  templateUrl: 'case-edit-submit.html',
  styleUrls: ['../case-edit.scss']
})
export class CaseEditSubmitComponent implements OnInit, OnDestroy {
  public eventTrigger: CaseEventTrigger;
  public editForm: FormGroup;
  public triggerText: string;
  public wizard: Wizard;
  public profile: Profile;
  public showSummaryFields: CaseField[];
  public paletteContext: PaletteContext = PaletteContext.CHECK_YOUR_ANSWER;
  public profileSubscription: Subscription;
  public contextFields: CaseField[];
  public task: Task;
  public pageTitle: string;

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
    return this.caseEdit.isSubmitting || this.hasErrors;
  }

  constructor(
    public readonly caseEdit: CaseEditComponent,
    private readonly fieldsUtils: FieldsUtils,
    private readonly caseFieldService: CaseFieldService,
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService,
    private readonly profileNotifier: ProfileNotifier,
  ) {
  }

  public ngOnInit(): void {
    this.profileSubscription = this.profileNotifier.profile.subscribe(_ => this.profile = _);
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.triggerText = this.eventTrigger.end_button_label || CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.showSummaryFields = this.sortFieldsByShowSummaryContent(this.eventTrigger.case_fields);
    this.caseEdit.isSubmitting = false;
    this.contextFields = this.getCaseFields();
    // Indicates if the submission is for a Case Flag, as opposed to a "regular" form submission, by the presence of
    // a FlagLauncher field in the event trigger
    this.caseEdit.isCaseFlagSubmission = this.eventTrigger.case_fields.some(caseField => FieldsUtils.isFlagLauncherCaseField(caseField));
    this.caseEdit.isLinkedCasesSubmission =
      this.eventTrigger.case_fields.some(caseField => FieldsUtils.isComponentLauncherCaseField(caseField));
    this.pageTitle = this.caseEdit.isCaseFlagSubmission ? 'Review flag details' : 'Check your answers';
  }

  public ngOnDestroy(): void {
     /* istanbul ignore else */
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  public submit(): void {
    this.caseEdit.submitForm({
      eventTrigger: this.eventTrigger,
      form: this.editForm,
      submit: this.caseEdit.submit,
      caseDetails: this.caseEdit.caseDetails,
    });
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

  private get hasErrors(): boolean {
    return this.caseEdit?.error?.callbackErrors?.length;
  }

  public navigateToPage(pageId: string): void {
    this.caseEdit.navigateToPage(pageId);
  }

  public callbackErrorsNotify(errorContext: CallbackErrorsContext): void {
    this.caseEdit.ignoreWarning = errorContext.ignoreWarning;
    this.triggerText = errorContext.triggerText;
  }

  public summaryCaseField(field: CaseField): CaseField {
     /* istanbul ignore else */
    if (null === this.editForm.get('data').get(field.id)) {
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
     /* istanbul ignore else */
    if (this.eventTrigger.show_summary || this.eventTrigger.show_summary === null) {
      for (const page of this.wizard.pages) {
        /* istanbul ignore else */
       if (page.case_fields && this.isShown(page)) {
         for (const field of page.case_fields) {
            /* istanbul ignore else */
           if (this.canShowFieldInCYA(field)) {
             // at least one field needs showing
             return true;
           }
         }
       }
     }
    } else {
      // found no fields to show in CYA summary page
      return false;
    }
  }

  public readOnlySummaryFieldsToDisplayExists(): boolean {
    return this.eventTrigger.case_fields.some(field => field.show_summary_content_option >= 0 );
  }

  public showEventNotes(): boolean {
    return this.eventTrigger.show_event_notes || this.eventTrigger.show_event_notes === null;
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
     /* istanbul ignore else */
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
    return this.caseEdit.getCaseId(this.caseEdit.caseDetails);
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