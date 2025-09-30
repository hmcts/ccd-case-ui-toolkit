import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CaseEventTrigger, CaseField, Profile } from '../../../domain';
import { Task } from '../../../domain/work-allocation/Task';
import {
  CaseFieldService,
  FieldsUtils,
  MultipageComponentStateService,
  FormValidatorsService,
  OrderService,
  ProfileNotifier
} from '../../../services';
import { CallbackErrorsComponent, CallbackErrorsContext } from '../../error';
import { PaletteContext } from '../../palette';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Wizard, WizardPage } from '../domain';
import { CaseEditSubmitTitles } from './case-edit-submit-titles.enum';
import { CaseFlagStateService } from '../services/case-flag-state.service';
import { LinkedCasesService } from '../../palette/linked-cases/services/linked-cases.service';
import { Router } from '@angular/router';

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
  public metadataFieldsObject: object;
  public allFieldsValues: any;
  public summary: AbstractControl;
  public description: AbstractControl;
  public eventSummaryLabel: string = 'Event summary';
  public eventDescriptionLabel: string = 'Event description';

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
  };

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
    private readonly multipageComponentStateService: MultipageComponentStateService,
    private readonly formValidatorsService: FormValidatorsService,
    private readonly caseFlagStateService: CaseFlagStateService,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly router: Router,
  ) {
  }

  public ngOnInit(): void {
    this.profileSubscription = this.profileNotifier.profile.subscribe((_) => this.profile = _);
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.triggerText = this.eventTrigger.end_button_label || CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
    this.editForm = this.caseEdit.form;
    this.redirectIfFormEmpty();
    this.wizard = this.caseEdit.wizard;
    this.showSummaryFields = this.sortFieldsByShowSummaryContent(this.eventTrigger.case_fields);
    this.caseEdit.isSubmitting = false;
    this.contextFields = this.getCaseFields();
    this.metadataFieldsObject = this.caseEdit?.caseDetails?.metadataFields?.
      reduce((o, key) => Object.assign(o, { [key.id]: key.value }), {});
    this.allFieldsValues = Object.assign(this.metadataFieldsObject ? this.metadataFieldsObject : {}, this.editForm.getRawValue().data);
    // Indicates if the submission is for a Case Flag, as opposed to a "regular" form submission, by the presence of
    // a FlagLauncher field in the event trigger
    this.caseEdit.isCaseFlagSubmission =
      this.eventTrigger.case_fields.some((caseField) => FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher']));
    this.caseEdit.isLinkedCasesSubmission =
      this.eventTrigger.case_fields.some(caseField => FieldsUtils.isCaseFieldOfType(caseField, ['ComponentLauncher']));
    this.pageTitle = this.getPageTitle();
    if (!this.caseFlagStateService.initialCaseFlags && this.caseEdit.isCaseFlagSubmission && Object.keys(this.caseEdit.form.value.data).length > 0){
      this.caseFlagStateService.initialCaseFlags = JSON.parse(JSON.stringify(this.caseEdit.form.value));
    }
    this.summary = this.formValidatorsService.addMarkDownValidators(this.editForm, 'event.summary');
    this.description = this.formValidatorsService.addMarkDownValidators(this.editForm, 'event.description');
  }

  public ngOnDestroy(): void {
    /* istanbul ignore else */
    if (this.profileSubscription) {
      this.profileSubscription.unsubscribe();
    }
  }

  public submit(): void {
    if (this.summary.valid && this.description.valid) {
      this.linkedCasesService.resetLinkedCaseData();
      this.checkExistingDataInSubmission();
      this.caseEdit.submitForm({
        eventTrigger: this.eventTrigger,
        form: this.editForm,
        submit: this.caseEdit.submit,
        caseDetails: this.caseEdit.caseDetails
      });
      this.caseFlagStateService.resetInitialCaseFlags();
    }
  }

  public onEventCanBeCompleted(eventCanBeCompleted: boolean): void {
    this.caseEdit.onEventCanBeCompleted({
      eventTrigger: this.eventTrigger,
      eventCanBeCompleted,
      caseDetails: this.caseEdit.caseDetails,
      form: this.editForm,
      submit: this.caseEdit.submit
    });
  }

  public checkExistingDataInSubmission() {
    if (this.caseEdit.isCaseFlagSubmission) {
      this.eventTrigger.case_fields.forEach((field) => {
        const fieldData = this.editForm.value.data[field.id];
        if (fieldData?.details) {
          const priorFlags = this.caseFlagStateService.initialCaseFlags.data[field.id].details;
          if (priorFlags) {
            priorFlags.forEach((flag) => {
              if (!field._value.details.some((detail) => detail.id === flag.id)) {
                field._value.details.push(flag);
              }
            });
            if (field._value) {
              field._value.details = field._value.details?.filter((detail: { id?: string }) => detail.id !== null);
              if (field.formatted_value?.groupId) {
                field._value.groupId = field.formatted_value.groupId;
              }
              if (field.formatted_value?.visibility) {
                field._value.visibility = field.formatted_value?.visibility;
              }
              if (field.formatted_value?.details) {
                field.formatted_value.details = field._value?.details;
              }
              fieldData.details = fieldData.details.filter((detail: { id?: string }) => detail.id !== null);
            }
          }
        }
      });
    }
  }

  private getPageTitle(): string {
    const caseFlagField = this.eventTrigger.case_fields.find(caseField => FieldsUtils.isCaseFieldOfType(caseField, ['FlagLauncher']));
    if (caseFlagField) {
      const isCaseFlagExternalMode = caseFlagField.display_context_parameter === '#ARGUMENT(UPDATE,EXTERNAL)' ||
        caseFlagField.display_context_parameter === '#ARGUMENT(CREATE,EXTERNAL)';
      return isCaseFlagExternalMode
        ? CaseEditSubmitTitles.REVIEW_SUPPORT_REQUEST
        : CaseEditSubmitTitles.REVIEW_FLAG_DETAILS;
    }
    return CaseEditSubmitTitles.CHECK_YOUR_ANSWERS;
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
    if (this.caseEdit.isLinkedCasesSubmission) {
      this.handleLinkedCasesSubmission();
    }
    this.caseFlagStateService.resetInitialCaseFlags();
    this.emitCancelEvent();
  }

  private handleLinkedCasesSubmission(): void {
    const linkedCasesTab = this.getLinkedCasesTab();
    const initialLinks = this.linkedCasesService.initialCaseLinkRefs;

    if (linkedCasesTab && linkedCasesTab.value.length !== initialLinks.length) {
      linkedCasesTab.value = linkedCasesTab.value.filter((item) =>
        initialLinks.includes(item.value.CaseReference)
      );
    }
    this.linkedCasesService.resetLinkedCaseData();
  }

  private getLinkedCasesTab(): CaseField | null {
    return this.caseEdit.caseDetails.tabs.find((tab) =>
      tab?.fields?.some((field) => field.id === 'caseLinks')
    )?.fields?.[0] ?? null;
  }

  private emitCancelEvent(): void {
    if (this.eventTrigger.can_save_draft) {
      const origin = this.route.snapshot.queryParamMap.get(CaseEditComponent.ORIGIN_QUERY_PARAM);
      const status = origin === 'viewDraft' ? CaseEditPageComponent.RESUMED_FORM_DISCARD : CaseEditPageComponent.NEW_FORM_DISCARD;
      this.caseEdit.cancelled.emit({ status });
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
    return this.eventTrigger.case_fields.some((field) => field.show_summary_content_option >= 0);
  }

  public showEventNotes(): boolean {
    // Display event notes related controls only if the following conditions are met
    // 1. show_event_notes flag is set to true
    // 2. profile is not a solicitor
    // 3. is not a case flags journey, as it uses a custom check your answers component
    if (this.eventTrigger.show_event_notes) {
      return !this.profile?.isSolicitor()
        && !this.caseEdit.isCaseFlagSubmission;
    }
    return false;
  }

  private getLastPageShown(): WizardPage {
    let lastPage: WizardPage;
    this.wizard.reverse().forEach((page) => {
      if (!lastPage && this.isShown(page)) {
        lastPage = page;
      }
    });
    // noinspection JSUnusedAssignment
    return lastPage;
  }

  public previous(): void {
    if (this.caseEdit.isCaseFlagSubmission) {
      // if we are in the caseflag journey we need to store the last page index so that the previous button on CYA will take to correct page
      this.caseFlagStateService.fieldStateToNavigate = this.caseFlagStateService.lastPageFieldState;
    }
    if (this.caseEdit.isLinkedCasesSubmission) {
      this.linkedCasesService.cameFromFinalStep = true;
    }
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
      .mergeCaseFieldsAndFormFields(this.eventTrigger.case_fields, this.editForm.controls.data.value);
    return page.parsedShowCondition.match(fields);
  }

  public canShowFieldInCYA(field: CaseField): boolean {
    return field.show_summary_change_option;
  }

  private sortFieldsByShowSummaryContent(fields: CaseField[]): CaseField[] {
    return this.orderService
      .sort(fields, CaseEditSubmitComponent.SHOW_SUMMARY_CONTENT_COMPARE_FUNCTION)
      .filter((cf) => cf.show_summary_content_option);
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
    }
    return 'Cancel';
  }
    const data = this.editForm?.getRawValue()?.data;
    const isEmpty = !data || (typeof data === 'object' && Object.keys(data).length === 0);

    if (isEmpty) {
      this.router.navigate(['/cases/case-filter']);
    }
  }
}

