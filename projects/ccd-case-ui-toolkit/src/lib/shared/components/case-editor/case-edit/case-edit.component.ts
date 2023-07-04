import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { finalize } from 'rxjs/operators';
import { ConditionalShowRegistrarService, GreyBarService } from '../../../directives';
import {
  CaseEditCaseSubmit, CaseEditGenerateCaseEventData, CaseEditGetNextPage,
  CaseEditSubmitForm,
  CaseEditonEventCanBeCompleted,
  CaseEventData, CaseEventTrigger, CaseField,
  CaseView, Draft, HttpError, Profile
} from '../../../domain';
import { Task } from '../../../domain/work-allocation/Task';
import {
  FieldsPurger, FieldsUtils, FormErrorService, FormValueService, LoadingService,
  SessionStorageService, WindowService
} from '../../../services';
import { Confirmation, Wizard, WizardPage } from '../domain';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { CaseNotifier, WizardFactoryService } from '../services';

@Component({
  selector: 'ccd-case-edit',
  templateUrl: 'case-edit.component.html',
  styleUrls: ['../case-edit.scss'],
  providers: [GreyBarService]
})
export class CaseEditComponent implements OnInit, OnDestroy {
  public static readonly ORIGIN_QUERY_PARAM = 'origin';
  public static readonly ALERT_MESSAGE = 'Page is being refreshed so you will be redirected to the first page of this event.';

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
    private readonly loadingService: LoadingService
  ) {}

  public ngOnInit(): void {
    this.wizard = this.wizardFactory.create(this.eventTrigger);
    this.initialUrl = this.sessionStorageService.getItem('eventUrl');
    this.isPageRefreshed = JSON.parse(this.sessionStorageService.getItem('isPageRefreshed'));

    this.checkPageRefresh();
    /* istanbul ignore else */
    if (this.router.url && !this.isPageRefreshed) {
      this.sessionStorageService.setItem('eventUrl', this.router.url);
    }

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
      this.windowsService.alert(CaseEditComponent.ALERT_MESSAGE);
      this.router.navigate([this.initialUrl], { relativeTo: this.route});
      return true;
    }
    return false;
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
    if(!nextPage &&
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
    this.submitted.emit({caseId: response['id'], status: this.getStatus(response)});
  }

  public getNextPage({ wizard, currentPageId, eventTrigger, form }: CaseEditGetNextPage): WizardPage {
    return wizard.nextPage(
      currentPageId,
      this.fieldsUtils.buildCanShowPredicate(eventTrigger, form)
    );
  }

  public confirm(confirmation: Confirmation): Promise<boolean> {
    this.confirmation = confirmation;
    return this.router.navigate(['confirm'], {relativeTo: this.route});
  }

  public submitForm({ eventTrigger, form, caseDetails, submit }: CaseEditSubmitForm ): void {
    this.isSubmitting = true;
    // We have to run the event completion checks if task in session storage
    // and if the task is in session storage, then is it associated to the case
    let taskInSessionStorage: Task;
    const taskStr = this.sessionStorageService.getItem('taskToComplete');
    if (taskStr) {
      taskInSessionStorage = JSON.parse(taskStr);
    }

    if (taskInSessionStorage && taskInSessionStorage.case_id === this.getCaseId(caseDetails)) {
      // Show event completion component to perform event completion checks
      this.eventCompletionParams = ({
        caseId: this.getCaseId(caseDetails),
        eventId: this.getEventId(form),
        task: taskInSessionStorage
      });
      this.isEventCompletionChecksRequired = true;
    } else {
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
  // Data population step required for JudicialUser
  this.formValueService.populateJudicialUserDetailsFromCaseFields(caseEventData.data, eventTrigger.case_fields);
  // Remove "Launcher"-type fields (these have no values and are not intended to be persisted)
  this.formValueService.removeCaseFieldsOfType(caseEventData.data, eventTrigger.case_fields, ['FlagLauncher', 'ComponentLauncher']);
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
          const form: FormGroup = new FormGroup({});
          if (formGroup.controls[key].value) {
            Object.keys(formGroup.controls[key].value).forEach((item) => {
              form.addControl(item, new FormControl(formGroup.controls[key].value[item]));
            });
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

  private caseSubmit({form, caseEventData, submit}: CaseEditCaseSubmit): void {
    const loadingSpinnerToken = this.loadingService.register();

    submit(caseEventData)
      .pipe(finalize(() => {
        this.loadingService.unregister(loadingSpinnerToken);
      }))
      .subscribe(
        response => {
          this.caseNotifier.cachedCaseView = null;
          this.sessionStorageService.removeItem('eventUrl');
          const confirmation: Confirmation = this.buildConfirmation(response);
          if (confirmation && (confirmation.getHeader() || confirmation.getBody())) {
            this.confirm(confirmation);
          } else {
            this.emitSubmitted(response);
          }
        },
        error => {
          this.error = error;
          this.callbackErrorsSubject.next(error);
          /* istanbul ignore else */
          if (this.error.details) {
            this.formErrorService
              .mapFieldErrors(this.error.details.field_errors, form.controls['data'] as FormGroup, 'validation');
          }
          this.isSubmitting = false;
        }
      );
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

  public onEventCanBeCompleted({ eventTrigger, eventCanBeCompleted, caseDetails, form, submit }: CaseEditonEventCanBeCompleted ): void {
    if (eventCanBeCompleted) {
      // Submit
      const caseEventData = this.generateCaseEventData({ eventTrigger, form });
      this.caseSubmit({ form, caseEventData, submit });
    } else {
      // Navigate to tasks tab on case details page
      this.router.navigate([`/cases/case-details/${this.getCaseId(caseDetails)}/tasks`], { relativeTo: this.route });
    }
  }


  public getStatus(response: object): any {
    return this.hasCallbackFailed(response) ? response['callback_response_status'] : response['delete_draft_response_status'];
  }

  private hasCallbackFailed(response: object): boolean {
    return response['callback_response_status'] !== 'CALLBACK_COMPLETED';
  }

}
