import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { finalize, switchMap } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../../app.config';
import { Constants } from '../../../commons/constants';
import { ConditionalShowRegistrarService, GreyBarService } from '../../../directives';
import {
  CaseEditCaseSubmit, CaseEditGenerateCaseEventData, CaseEditGetNextPage,
  CaseEditSubmitForm,
  CaseEditonEventCanBeCompleted,
  CaseEventData, CaseEventTrigger, CaseField,
  CaseView, Draft, HttpError, Profile
} from '../../../domain';
import { UserInfo } from '../../../domain/user/user-info.model';
import { EventDetails, Task, TaskEventCompletionInfo } from '../../../domain/work-allocation/Task';
import {
  AlertService,
  FieldsPurger, FieldsUtils, FormErrorService, FormValueService, LoadingService,
  ReadCookieService,
  SessionStorageService, WindowService
} from '../../../services';
import { Confirmation, Wizard, WizardPage } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { CaseNotifier, WizardFactoryService, WorkAllocationService } from '../services';
import { ValidPageListCaseFieldsService } from '../services/valid-page-list-caseFields.service';
import { removeTaskFromClientContext } from '../case-edit-utils/case-edit.utils';
import { safeJsonParse } from '../../../json-utils';

@Component({
  selector: 'ccd-case-edit',
  templateUrl: 'case-edit.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: [GreyBarService],
  standalone: false
})
export class CaseEditComponent implements OnInit, OnDestroy {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  public static readonly ALERT_MESSAGE = 'Page is being refreshed so you will be redirected to the first page of this event.';
  public static readonly CLIENT_CONTEXT = 'clientContext';
  public static readonly TASK_EVENT_COMPLETION_INFO = 'taskEventCompletionInfo';

  @Input()
  public eventTrigger: CaseEventTrigger;

  @Input()
  public submit: (caseEventData: CaseEventData, profile?: Profile) => Observable<object>;

  @Input()
  public validate: (caseEventData: CaseEventData, pageId: string) => Observable<object>;

  @Input()
  public saveDraft: (caseEventData: CaseEventData) => Observable<Draft>;

  @Input()
  public caseDetails: CaseView;

  @Output()
  public cancelled: EventEmitter<any> = new EventEmitter();

  @Output()
  public submitted: EventEmitter<any> = new EventEmitter();

  public wizard: Wizard;

  public form: FormGroup;

  public confirmation: Confirmation;

  public navigationOrigin: any;

  public initialUrl: string;

  public isPageRefreshed: boolean;

  public isSubmitting: boolean;

  public eventCompletionParams: EventCompletionParams;

  public submitResponse: Record<string, any>;

  public isEventCompletionChecksRequired = false;

  public isCaseFlagSubmission = false;

  public ignoreWarning = false;

  public isLinkedCasesSubmission = false;

  public error: HttpError;

  public callbackErrorsSubject: Subject<any> = new Subject();

  public validPageList: WizardPage[] = [];

  public isRefreshModalVisible = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly caseNotifier: CaseNotifier,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly fieldsUtils: FieldsUtils,
    private readonly fieldsPurger: FieldsPurger,
    private readonly registrarService: ConditionalShowRegistrarService,
    private readonly wizardFactory: WizardFactoryService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly windowsService: WindowService,
    private readonly formValueService: FormValueService,
    private readonly formErrorService: FormErrorService,
    private readonly loadingService: LoadingService,
    private readonly validPageListCaseFieldsService: ValidPageListCaseFieldsService,
    private readonly workAllocationService: WorkAllocationService,
    private readonly alertService: AlertService,
    private readonly abstractConfig: AbstractAppConfig,
    private readonly cookieService: ReadCookieService
  ) {}

  public ngOnInit(): void {
    this.wizard = this.wizardFactory.create(this.eventTrigger);
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    this.isPageRefreshed = safeJsonParse<boolean>(this.sessionStorageService.getItem('isPageRefreshed'), false);

    this.checkPageRefresh();

    this.form = this.fb.group({
      data: new FormGroup({}),
      event: this.fb.group({
        id: [this.eventTrigger.id, Validators.required],
        summary: [''],
        description: ['']
      })
    });

    this.route.queryParams.subscribe((params: Params) => {
      this.navigationOrigin = params[CaseEditComponent.ORIGIN_QUERY_PARAM];
    });
  }

  public ngOnDestroy(): void {
    /* istanbul ignore else */
    if (this.callbackErrorsSubject) {
      this.callbackErrorsSubject.unsubscribe();
    }
  }

  public checkPageRefresh(): boolean {
    if (this.isPageRefreshed && this.initialUrl) {
      this.sessionStorageService.removeItem('eventUrl');
      this.isRefreshModalVisible = true;
      this.router.navigate([this.initialUrl], { relativeTo: this.route });
      return true;
    }
    // if the url contains /submit there is the potential that the user has gone straight to the submit page
    // we should try and work out if they have been through the journey or not and prevent them submitting directly
    const hasSubmitPathOnly = /\/submit(?:\?.*)?$/.test(this.router.url);
    if (hasSubmitPathOnly && !this.initialUrl) {
      // we only want to check if the user has done this if there is a multi-page journey
      if (this.eventTrigger.wizard_pages && this.eventTrigger.wizard_pages.length > 0) {
        const firstPage = this.eventTrigger.wizard_pages.reduce((min, page) => page.order < min.order ? page : min, this.eventTrigger.wizard_pages[0]);
        this.isRefreshModalVisible = true;
        this.router.navigate([firstPage ? firstPage.id : 'submit'], { relativeTo: this.route });
      }
    }
    return false;
  }

  public onRefreshModalOk(): void {
    this.isRefreshModalVisible = false;
  }

  public getPage(pageId: string): WizardPage {
    return this.wizard.getPage(pageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  public first(): Promise<boolean> {
    const firstPage = this.wizard.firstPage(this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    return this.router.navigate([firstPage ? firstPage.id : 'submit'], { relativeTo: this.route });
  }

  public navigateToPage(pageId: string): Promise<boolean> {
    const page = this.getPage(pageId);
    return this.router.navigate([page ? page.id : 'submit'], { relativeTo: this.route });
  }

  public next(currentPageId: string): Promise<boolean> {
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    /* istanbul ignore else */
    if (this.router.url && !this.initialUrl) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    const nextPage = this.getNextPage({
      currentPageId,
      wizard: this.wizard,
      eventTrigger: this.eventTrigger,
      form: this.form,
    });

    /* istanbul ignore else */
    if (!nextPage &&
      !(this.eventTrigger.show_summary || this.eventTrigger.show_summary === null) &&
      !this.eventTrigger.show_event_notes) {
      this.submitForm({
        eventTrigger: this.eventTrigger,
        form: this.form,
        submit: this.submit,
        caseDetails: this.caseDetails,
      });
      return;
    }

    this.registrarService.reset();

    const theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    return this.router.navigate([nextPage ? nextPage.id : 'submit'], { queryParams: theQueryParams, relativeTo: this.route });
  }

  public previous(currentPageId: string): Promise<boolean> {
    this.fieldsPurger.clearHiddenFields(this.form, this.wizard, this.eventTrigger, currentPageId);
    this.registrarService.reset();

    const previousPage = this.wizard.previousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
    /* istanbul ignore else */
    if (!previousPage) {
      return Promise.resolve(false);
    }

    const theQueryParams: Params = {};
    theQueryParams[CaseEditComponent.ORIGIN_QUERY_PARAM] = this.navigationOrigin;
    return this.router.navigate([previousPage.id], { queryParams: theQueryParams, relativeTo: this.route });
  }

  public hasPrevious(currentPageId: string): boolean {
    return this.wizard.hasPreviousPage(currentPageId, this.fieldsUtils.buildCanShowPredicate(this.eventTrigger, this.form));
  }

  public cancel(): void {
    this.cancelled.emit();
  }

  public emitSubmitted(response: Record<string, any>): void {
    this.submitted.emit({ caseId: response['id'], jurisdiction: response['jurisdiction'], caseType: response['case_type'], status: this.getStatus(response) });
  }

  public getNextPage({ wizard, currentPageId, eventTrigger, form }: CaseEditGetNextPage): WizardPage {
    return wizard.nextPage(
      currentPageId,
      this.fieldsUtils.buildCanShowPredicate(eventTrigger, form)
    );
  }

  public confirm(confirmation: Confirmation): Promise<boolean> {
    this.confirmation = confirmation;
    return this.router.navigate(['confirm'], { relativeTo: this.route });
  }

  public submitForm({ eventTrigger, form, caseDetails, submit }: CaseEditSubmitForm): void {
    this.isSubmitting = true;
    // We have to run the event completion checks if task in session storage
    // and if the task is in session storage, then is it associated to the case
    const clientContextStr = this.sessionStorageService.getItem(CaseEditComponent.CLIENT_CONTEXT);
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    const taskInSessionStorage = userTask ? userTask.task_data : null;
    let taskEventCompletionInfo: TaskEventCompletionInfo;
    let userInfo: UserInfo;
    const taskEventCompletionStr = this.sessionStorageService.getItem(CaseEditComponent.TASK_EVENT_COMPLETION_INFO);
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const assignNeeded = this.sessionStorageService.getItem('assignNeeded');
    taskEventCompletionInfo = safeJsonParse<TaskEventCompletionInfo>(taskEventCompletionStr, null);
    userInfo = safeJsonParse<UserInfo>(userInfoStr, null);
    const eventId = this.getEventId(form);
    const caseId = this.getCaseId(caseDetails);
    const userId = userInfo?.id ? userInfo.id : userInfo?.uid;
    const eventDetails: EventDetails = {eventId, caseId, userId, assignNeeded};
    if (this.taskExistsForThisEvent(taskInSessionStorage, taskEventCompletionInfo, eventDetails)) {
      this.abstractConfig.logMessage(`task ${taskInSessionStorage?.id} exist for this event for caseId and eventId as ${caseId} ${eventId}`);
      // Show event completion component to perform event completion checks
      this.eventCompletionParams = ({
        caseId,
        eventId,
        task: taskInSessionStorage
      });
      // add taskEventCompletionInfo again to ensure link current event with task id
      // note: previous usage was created here so this is to ensure correct functionality continues
      const taskEventCompletionInfo: TaskEventCompletionInfo = {
        caseId,
        eventId,
        userId,
        taskId: taskInSessionStorage.id,
        createdTimestamp: Date.now()};
      this.sessionStorageService.setItem(CaseEditComponent.TASK_EVENT_COMPLETION_INFO, JSON.stringify(taskEventCompletionInfo));
      this.isEventCompletionChecksRequired = true;
    } else {
      this.abstractConfig.logMessage(`task does not exist for caseId and eventId as ${caseId} ${eventId}`);
      // Task not in session storage, proceed to submit
      const caseEventData = this.generateCaseEventData({
        eventTrigger,
        form
      });
      this.caseSubmit({form,
        caseEventData,
        submit
      });
    }
  }

  public getCaseId(caseDetails: CaseView): string {
    return (caseDetails ? caseDetails.case_id : '');
  }

  private getEventId(form: FormGroup): string {
    return form.value.event.id;
  }

  private generateCaseEventData({ eventTrigger, form }: CaseEditGenerateCaseEventData ): CaseEventData {
    const caseEventData: CaseEventData = {
      data: this.replaceEmptyComplexFieldValues(
        this.formValueService.sanitise(
          this.replaceHiddenFormValuesWithOriginalCaseData(
            form.get('data') as FormGroup, eventTrigger.case_fields))),
      event: form.value.event
    } as CaseEventData;
    this.formValueService.clearNonCaseFields(caseEventData.data, eventTrigger.case_fields);
    this.formValueService.removeNullLabels(caseEventData.data, eventTrigger.case_fields);
    this.formValueService.removeEmptyDocuments(caseEventData.data, eventTrigger.case_fields);
    // Remove collection fields that have "min" validation of greater than zero set on the FieldType but are empty;
    // these will fail validation
    this.formValueService.removeEmptyCollectionsWithMinValidation(caseEventData.data, eventTrigger.case_fields);
    // For Case Flag submissions (where a FlagLauncher field is present in the event trigger), the flag details data
    // needs populating for each Flags field, then the FlagLauncher field needs removing
    this.formValueService.repopulateFormDataFromCaseFieldValues(caseEventData.data, eventTrigger.case_fields);
    // Data population step required for Linked Cases
    this.formValueService.populateLinkedCasesDetailsFromCaseFields(caseEventData.data, eventTrigger.case_fields);
    // Remove "Launcher"-type fields (these have no values and are not intended to be persisted)
    this.formValueService.removeCaseFieldsOfType(caseEventData.data, eventTrigger.case_fields, ['FlagLauncher', 'ComponentLauncher']);

    // delete fields which are not part of the case event journey wizard pages case fields
    this.validPageListCaseFieldsService.deleteNonValidatedFields(this.validPageList, caseEventData.data, eventTrigger.case_fields, false, form.controls['data'].value);
    const pageListCaseFields = this.validPageListCaseFieldsService.validPageListCaseFields(this.validPageList, eventTrigger.case_fields, form.controls['data'].value);
    // Remove unnecessary case fields which are hidden, only if the submission is *not* for Case Flags
    if (!this.isCaseFlagSubmission) {
      this.formValueService.removeUnnecessaryFields(caseEventData.data, pageListCaseFields, true, true);
    }

    caseEventData.event_token = eventTrigger.event_token;
    caseEventData.ignore_warning = this.ignoreWarning;
    if (this.confirmation) {
      caseEventData.data = {};
    }

    return caseEventData;
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
    /* istanbul ignore next */
    Object.keys(rawFormValueData).forEach((key) => {
      const caseField: CaseField = caseFieldsLookup[key];
      // If caseField.hidden is NOT truthy and also NOT equal to false, then it must be null/undefined (remember that
      // both null and undefined are equal to *neither false nor true*)
      if (caseField?.retain_hidden_value &&
        (caseField?.hidden || (caseField?.hidden !== false && parentField?.hidden))) {
        if (caseField.field_type.type === 'Complex') {
          this.handleComplexField(caseField, formGroup, key, rawFormValueData);
        } else {
          this.handleNonComplexField(parentField, rawFormValueData, key, caseField);
        }
      }
    });

    return rawFormValueData;
  }

  private handleNonComplexField(parentField: CaseField, rawFormValueData, key: string, caseField: CaseField) {
    // Default case also handles collections of *all* types; the entire collection in rawFormValueData will be
    // replaced with the original from formatted_value
    // Use the CaseField's existing *formatted_value* from the parent, if available. (This is necessary for
    // Complex fields, whose sub-fields do not hold any values in the model.) Otherwise, use formatted_value
    // from the CaseField itself.
    if (parentField && parentField.formatted_value) {
      rawFormValueData[key] = parentField.formatted_value[caseField.id];
    } else {
      if (!(caseField.hidden && caseField.retain_hidden_value)) {
        rawFormValueData[key] = caseField.formatted_value;
      }
    }
  }

  private handleComplexField(caseField: CaseField, formGroup: FormGroup<any>, key: string, rawFormValueData) {
    // Note: Deliberate use of equality (==) and non-equality (!=) operators for null checks throughout, to
    // handle both null and undefined values
    if (caseField.value != null) {
      // Call this function recursively to replace the Complex field's sub-fields as necessary, passing the
      // CaseField itself (the sub-fields do not contain any values, so these need to be obtained from the
      // parent)
      // Update rawFormValueData for this field
      // creating form group and adding control into it in case caseField is of complext type and and part of formGroup
      const form: FormGroup = new FormGroup({});
      if (formGroup.controls[key].value) {
        Object.keys(formGroup.controls[key].value).forEach((item) => {
          form.addControl(item, new FormControl(formGroup.controls[key].value[item]));
        });
      }
      rawFormValueData[key] = this.replaceHiddenFormValuesWithOriginalCaseData(
        form, caseField.field_type.complex_fields, caseField);
    }
  }

  private caseSubmit({ form, caseEventData, submit }: CaseEditCaseSubmit): void {
    const loadingSpinnerToken = this.loadingService.register();
    // keep the initial event response to finalise process after task completion
    let eventResponse: object;
    this.sessionStorageService.setItem('taskCompletionError', 'false');
    submit(caseEventData).pipe(switchMap((response) => {
      eventResponse = response;
      this.abstractConfig.logMessage(`Event ${this.eventCompletionParams?.eventId} of case Id ${this.eventCompletionParams?.caseId} and taskId ${this.eventCompletionParams?.task?.id}`);
      return this.postCompleteTaskIfRequired();
    }),finalize(() => {
        this.loadingService.unregister(loadingSpinnerToken);
        // on event completion ensure the previous event clientContext/taskEventCompletionInfo removed
        // Note - Not removeTaskFromClientContext because could interfere with other logic
        this.abstractConfig.logMessage(`Clearing client context and task event completion info after event ${this.eventCompletionParams?.eventId} submission of case Id ${this.eventCompletionParams?.caseId} and task Id ${this.eventCompletionParams?.task?.id}`);
        this.sessionStorageService.removeItem(CaseEditComponent.CLIENT_CONTEXT);
        this.sessionStorageService.removeItem(CaseEditComponent.TASK_EVENT_COMPLETION_INFO)
        this.isSubmitting = false;
      }))
      .subscribe(
        () => {
          this.finishEventCompletionLogic(eventResponse);
        },
        error => {
          this.abstractConfig.logMessage(`An error occurred while submission of event ${this.eventCompletionParams?.eventId} and case Id ${this.eventCompletionParams?.caseId} and taskId ${this.eventCompletionParams?.task?.id}`);
          if (!eventResponse) {
            // event submission error
            this.error = error;
            this.callbackErrorsSubject.next(error);
            /* istanbul ignore else */
            if (this.error.details) {
              this.formErrorService
                .mapFieldErrors(this.error.details.field_errors, form.controls['data'] as FormGroup, 'validation');
            }
          } else {
            this.sessionStorageService.setItem('taskCompletionError', 'true');
            // task assignment/completion error - handled within workallocation service
            // could set task to be deleted (or completed later)?
            this.finishEventCompletionLogic(eventResponse);
            // below allows error to be shown on navigation to confirmation page
            this.alertService.setPreserveAlerts(true);
            this.alertService.error({phrase: Constants.TASK_COMPLETION_ERROR});
          }
        }
      );
  }

  private postCompleteTaskIfRequired(): Observable<any> {
    const clientContextStr = this.sessionStorageService.getItem(CaseEditComponent.CLIENT_CONTEXT);
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    const [task, taskToBeCompleted] = userTask ? [userTask.task_data, userTask.complete_task] : [null, false];
    const assignNeeded = this.sessionStorageService.getItem('assignNeeded') === 'true';
    if (task && assignNeeded && taskToBeCompleted) {
      this.abstractConfig.logMessage(`postCompleteTaskIfRequired with assignNeeded: taskId ${task.id} and event name ${this.eventTrigger?.name}`);
      return this.workAllocationService.assignAndCompleteTask(task.id, this.eventTrigger.name);
    } else if (task && taskToBeCompleted) {
      this.abstractConfig.logMessage(`postCompleteTaskIfRequired: taskId ${task.id} and event name ${this.eventTrigger?.name}`);
      return this.workAllocationService.completeTask(task.id, this.eventTrigger.name);
    }
    this.abstractConfig.logMessage(`postCompleteTaskIfRequired: no task to complete for event name ${this.eventTrigger?.name} and caseId ${this.caseDetails?.case_id}`);
    return of(true);
  }

  private finishEventCompletionLogic(eventResponse: any): void {
    this.caseNotifier.cachedCaseView = null;
    this.sessionStorageService.removeItem('eventUrl');
    const confirmation: Confirmation = this.buildConfirmation(eventResponse);
    if (confirmation && (confirmation.getHeader() || confirmation.getBody())) {
      this.confirm(confirmation);
    } else {
      this.emitSubmitted(eventResponse);
    }
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

  // checks whether current clientContext relevant for the event
  public taskExistsForThisEvent(taskInSessionStorage: Task, taskEventCompletionInfo: TaskEventCompletionInfo, eventDetails: EventDetails): boolean {
    if (!taskInSessionStorage || taskInSessionStorage.case_id !== eventDetails.caseId) {
      return false;
    }
    if (!taskEventCompletionInfo) {
      // if no task event present then there is no task to complete from previous event present
      // EXUI-2668 - Add additional logic to confirm the task is relevant to the event
      if (this.taskIsForEvent(taskInSessionStorage, eventDetails)) {
        return true;
      } else {
        // client context still needed for language
        removeTaskFromClientContext(this.sessionStorageService);
        return false;
      }
    } else {
      if (taskEventCompletionInfo.taskId !== taskInSessionStorage.id) {
        return true;
      } else if ((taskEventCompletionInfo.taskId === taskInSessionStorage.id &&
          this.eventDetailsDoNotMatch(taskEventCompletionInfo, eventDetails))
        || this.eventMoreThanDayAgo(taskEventCompletionInfo.createdTimestamp)
      ) {
        // if the session storage not related to event, ignore it and remove
        removeTaskFromClientContext(this.sessionStorageService);
        this.sessionStorageService.removeItem(CaseEditComponent.TASK_EVENT_COMPLETION_INFO);
        return false;
      }
      if (eventDetails.assignNeeded === 'false' && eventDetails.userId !== taskInSessionStorage.assignee) {
        // if the user does not match task assignee, assign is now needed
        // data cannot be deleted and ignored as it matches understanding
        this.sessionStorageService.setItem('assignNeeded', 'true');
      }
      return true;
    }
  }

  public onEventCanBeCompleted({ eventTrigger, eventCanBeCompleted, caseDetails, form, submit }: CaseEditonEventCanBeCompleted): void {
    if (eventCanBeCompleted) {
      // Submit
      const caseEventData = this.generateCaseEventData({ eventTrigger, form });
      this.caseSubmit({ form, caseEventData, submit });
    } else {
      // Navigate to tasks tab on case details page
      this.router.navigate([`/cases/case-details/${this.caseDetails.case_type.jurisdiction.id}/${this.caseDetails.case_type.id}/${this.getCaseId(caseDetails)}`], { fragment: 'Tasks' });
    }
  }

  public getStatus(response: object): any {
    return this.hasCallbackFailed(response) ? response['callback_response_status'] : response['delete_draft_response_status'];
  }

  private hasCallbackFailed(response: object): boolean {
    return response['callback_response_status'] !== 'CALLBACK_COMPLETED';
  }

  private eventMoreThanDayAgo(timestamp: number) {
    if ((new Date().getTime() - timestamp) > (24*60*60*1000)) {
      return true;
    }
    return false;
  }

  private eventDetailsDoNotMatch(taskEventCompletionInfo: TaskEventCompletionInfo, eventDetails: EventDetails) {
    if (taskEventCompletionInfo.eventId !== eventDetails.eventId
      || taskEventCompletionInfo.caseId !== eventDetails.caseId
      || taskEventCompletionInfo.userId !== eventDetails.userId) {
      return true;
    }
    return false;
  }

  private taskIsForEvent(task: Task, eventDetails: EventDetails): boolean {
    // EXUI-2668 - Ensure description for task includes event ID
    // Note - This is a failsafe for an edge case that may never occur again
    // Description may not include eventId in some cases which may mean task not completed (however this will be easy to check)
    // In instances of the above taskEventCompletionInfo will be created to block this check from occurring
    this.abstractConfig.logMessage(`checking taskIsForEvent: task ID ${task.id}, task description ${task.description}, event name ${eventDetails.eventId}`);
    return task.case_id === eventDetails.caseId && (task.description?.includes(eventDetails.eventId));
  }
}
