import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Subject } from 'rxjs';
import { CallbackErrorsComponent } from '../../error/callback-errors.component';
import { CallbackErrorsContext } from '../../error/domain/error-context';
import { ActivatedRoute } from '@angular/router';
import { ProfileNotifier } from '../../../services/profile';
import { HttpError } from '../../../domain/http';
import { PaletteContext } from '../../palette';
import { FormValueService } from '../../../services/form/form-value.service';
import { FormErrorService } from '../../../services/form/form-error.service';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Wizard } from '../domain/wizard.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { OrderService } from '../../../services/order/order.service';
import { CaseEventData } from '../../../domain/case-event-data.model';
import { Confirmation } from '../domain/confirmation.model';
import { WizardPage } from '../domain/wizard-page.model';
import { CaseEditPageComponent } from '../case-edit-page/case-edit-page.component';
import { ProfileService } from '../../../services/profile/profile.service';
import { Profile } from '../../../domain';

// @dynamic
@Component({
  selector: 'ccd-case-edit-submit',
  templateUrl: 'case-edit-submit.html',
  styleUrls: ['../case-edit.scss']
})
export class CaseEditSubmitComponent implements OnInit {
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
    this.profileNotifier.profileSource.asObservable().first().subscribe(_ => this.profile = _);
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.triggerText = this.eventTrigger.end_button_label || CallbackErrorsComponent.TRIGGER_TEXT_SUBMIT;
    this.editForm = this.caseEdit.form;
    this.wizard = this.caseEdit.wizard;
    this.announceProfile(this.route);
    this.showSummaryFields = this.sortFieldsByShowSummaryContent(this.eventTrigger.case_fields);
  }

  submit(): void {
    let caseEventData: CaseEventData = this.formValueService.sanitise(this.editForm.value) as CaseEventData;
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
        }
      );
  }

  isDisabled(): boolean {
    return !this.editForm.valid || this.hasErrors();
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
    let cloneField: CaseField = Object.assign({}, field);

    if (null == this.editForm.get('data').get(field.id)) {
      // If not in form, return field itself
      return field;
    }

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
