import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { scan } from 'rxjs/operators';
import { CaseNotifier, Confirmation, WizardPage } from '../../components';
import { LinkedCasesError } from '../../components/palette/linked-cases/domain/linked-cases-state.model';
import {
  CaseEditCaseSubmit,
  CaseEditGenerateCaseEventData,
  CaseEditGetNextPage,
  CaseEditonEventCanBeCompleted,
  CaseEditState,
  CaseEditSubmitForm,
  CaseEventData,
  CaseField,
  CaseView
} from '../../domain';
import { Task } from '../../domain/work-allocation/Task';
import { FieldsUtils, FormErrorService, FormValueService, SessionStorageService } from '../../services';
import { CaseEditValidationError } from './case-edit-validation.model';

@Injectable()
export class CaseEditDataService {
  private readonly caseEditInitialState: Partial<CaseEditState> = {
    isEventCompletionChecksRequired: false,
    isCaseFlagSubmission: false,
    ignoreWarning: false,
    isLinkedCasesSubmission: false,
    error: null,
    callbackErrors: null,
  };

  private readonly title$ = new BehaviorSubject<string>(null);
  private readonly formValidationErrors$ = new BehaviorSubject<CaseEditValidationError[]>([]);
  private readonly eventTriggerName$ = new BehaviorSubject<string>(null);
  private readonly triggerSubmitEvent$ = new BehaviorSubject<boolean>(null);
  private readonly details$ = new BehaviorSubject<CaseView>(null);
  private readonly editForm$ = new BehaviorSubject<FormGroup>(null);
  private readonly linkError$ = new BehaviorSubject<LinkedCasesError>(null);

  public caseDetails$ = this.details$.asObservable();
  public caseTitle$ = this.title$.asObservable();
  public caseEditForm$ = this.editForm$.asObservable();
  public caseFormValidationErrors$ = this.formValidationErrors$.asObservable();
  public caseLinkError$ = this.linkError$.asObservable();
  public caseEventTriggerName$ = this.eventTriggerName$.asObservable();
  public caseTriggerSubmitEvent$ = this.triggerSubmitEvent$.asObservable();

  private readonly caseEditStateBehaviorSubject$ = new BehaviorSubject<Partial<CaseEditState>>(this.caseEditInitialState);

  public caseEditState$ = this.caseEditStateBehaviorSubject$.asObservable().pipe(scan((currentValue:Partial<CaseEditState>, newValue: Partial<CaseEditState>) => ({ ...currentValue, ...newValue})));

  constructor(
    private readonly fieldsUtils: FieldsUtils,
    private readonly formValueService: FormValueService,
    private readonly formErrorService: FormErrorService,
    private readonly caseNotifier: CaseNotifier,
    private readonly sessionStorageService: SessionStorageService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  // public updateIsEventCompletionChecksRequired(isEventCompletionChecksRequired: CaseEditState['isEventCompletionChecksRequired']): void {
  //   this.caseEditStateBehaviorSubject$.next({isEventCompletionChecksRequired});
  // }
  // public updateIsSubmitting(isSubmitting: CaseEditState['isSubmitting']): void {
  //   this.caseEditStateBehaviorSubject$.next({isSubmitting});
  // }
  // public updateEventCompletionParams(eventCompletionParams: CaseEditState['eventCompletionParams']): void {
  //   this.caseEditStateBehaviorSubject$.next({eventCompletionParams});
  // }
  // public updateIsCaseFlagSubmission(isCaseFlagSubmission: CaseEditState['isCaseFlagSubmission']): void {
  //   this.caseEditStateBehaviorSubject$.next({isCaseFlagSubmission});
  // }
  // public updateIsLinkedCasesSubmission(isLinkedCasesSubmission: CaseEditState['isLinkedCasesSubmission']): void {
  //   this.caseEditStateBehaviorSubject$.next({isLinkedCasesSubmission});
  // }
  // public updateIgnoreWarning(ignoreWarning: CaseEditState['ignoreWarning']): void {
  //   this.caseEditStateBehaviorSubject$.next({ignoreWarning});
  // }
  // public updateError(error: CaseEditState['error']): void {
  //   this.caseEditStateBehaviorSubject$.next({error});
  // }

  // public updateCallbackErrors(callbackErrors: CaseEditState['callbackErrors']): void {
  //   this.caseEditStateBehaviorSubject$.next({callbackErrors});
  // }

  // public updateConfirmation(confirmation: CaseEditState['confirmation']): void {
  //   this.caseEditStateBehaviorSubject$.next({confirmation});
  // }

  // public updateSubmitResponse(submitResponse: CaseEditState['submitResponse']): void {
  //   this.caseEditStateBehaviorSubject$.next({submitResponse});
  // }

  public setCaseDetails(caseDetails: CaseView): void {
    this.details$.next(caseDetails);
  }

  public setCaseTitle(caseTitle: string): void {
    this.title$.next(caseTitle);
  }

  public setCaseEventTriggerName(triggerName: string): void {
    this.eventTriggerName$.next(triggerName);
  }

  public setCaseLinkError(error: LinkedCasesError): void {
    this.linkError$.next(error);
  }

  public setFormValidationErrors(validationErrors: any[]): void {
    this.formValidationErrors$.next(validationErrors);
  }

  public setCaseEditForm(editForm: FormGroup): void {
    this.editForm$.next(editForm);
  }

  public clearFormValidationErrors(): void {
    this.formValidationErrors$.next([]);
  }

  public clearCaseLinkError(): void {
    this.linkError$.next(null);
  }

  public addFormValidationError(validationError: CaseEditValidationError): void {
    this.formValidationErrors$.next(
      this.formValidationErrors$.getValue().concat([validationError])
    );
  }

  public setTriggerSubmitEvent(state: boolean): void {
    this.triggerSubmitEvent$.next(state);
  }

  // public getNextPage({ wizard, currentPageId, eventTrigger, form }: CaseEditGetNextPage): WizardPage {
  //   return wizard.nextPage(
  //     currentPageId,
  //     this.fieldsUtils.buildCanShowPredicate(eventTrigger, form)
  //   );
  // }

  // public submitForm({ eventTrigger, form, caseEditState, caseDetails, submit }: CaseEditSubmitForm ): void {
  //   this.updateIsSubmitting(true);
  //   // We have to run the event completion checks if task in session storage
  //   // and if the task is in session storage, then is it associated to the case
  //   let taskInSessionStorage: Task;
  //   const taskStr = this.sessionStorageService.getItem('taskToComplete');
  //   if (taskStr) {
  //     taskInSessionStorage = JSON.parse(taskStr);
  //   }

  //   if (taskInSessionStorage && taskInSessionStorage.case_id === this.getCaseId(caseDetails)) {
  //     // Show event completion component to perform event completion checks
  //     this.updateEventCompletionParams({
  //       caseId: this.getCaseId(caseDetails),
  //       eventId: this.getEventId(form),
  //       task: taskInSessionStorage
  //     });
  //     this.updateIsEventCompletionChecksRequired(true);
  //   } else {
  //     // Task not in session storage, proceed to submit
  //     const caseEventData = this.generateCaseEventData({
  //       eventTrigger,
  //       form,
  //       caseEditState
  //     });
  //     this.caseSubmit({form,
  //       caseEventData,
  //       caseEditState,
  //       submit});
  //   }
  // }

  // private generateCaseEventData({ eventTrigger, form, caseEditState }: CaseEditGenerateCaseEventData ): CaseEventData {
  //   const caseEventData: CaseEventData = {
  //     data: this.replaceEmptyComplexFieldValues(
  //       this.formValueService.sanitise(
  //         this.replaceHiddenFormValuesWithOriginalCaseData(
  //           form.get('data') as FormGroup, eventTrigger.case_fields))),
  //     event: form.value.event
  //   } as CaseEventData;
  //   this.formValueService.clearNonCaseFields(caseEventData.data, eventTrigger.case_fields);
  //   this.formValueService.removeNullLabels(caseEventData.data, eventTrigger.case_fields);
  //   this.formValueService.removeEmptyDocuments(caseEventData.data, eventTrigger.case_fields);
  //   // Remove collection fields that have "min" validation of greater than zero set on the FieldType but are empty;
  //   // these will fail validation
  //   this.formValueService.removeEmptyCollectionsWithMinValidation(caseEventData.data, eventTrigger.case_fields);
  //   // If this is a Case Flag submission (and thus a FlagLauncher field is present in the event trigger), the flag
  //   // details data needs populating for each Flags field, then the FlagLauncher field needs removing
  //   if (caseEditState.isCaseFlagSubmission) {
  //     this.formValueService.populateFlagDetailsFromCaseFields(caseEventData.data, eventTrigger.case_fields);
  //     this.formValueService.removeFlagLauncherField(caseEventData.data, eventTrigger.case_fields);
  //   }

  //   if (caseEditState.isLinkedCasesSubmission) {
  //     this.formValueService.populateLinkedCasesDetailsFromCaseFields(caseEventData.data, eventTrigger.case_fields);
  //     this.formValueService.removeComponentLauncherField(caseEventData.data, eventTrigger.case_fields);
  //   }

  //   caseEventData.event_token = eventTrigger.event_token;
  //   caseEventData.ignore_warning = caseEditState.ignoreWarning;
  //   if (caseEditState.confirmation) {
  //     caseEventData.data = {};
  //   }

  //   return caseEventData;
  // }

  //  /**
  //   * Replaces non-array value objects with `null` for any Complex-type fields whose value is effectively empty, i.e.
  //   * all its sub-fields and descendants are `null` or `undefined`.
  //   *
  //   * @param data The object tree representing all the form field data
  //   * @returns The form field data modified accordingly
  //   */
  //  private replaceEmptyComplexFieldValues(data: object): object {
  //   Object.keys(data).forEach((key) => {
  //     if (!Array.isArray(data[key]) && typeof data[key] === 'object' && !FieldsUtils.containsNonEmptyValues(data[key])) {
  //       data[key] = null;
  //     }
  //   });

  //   return data;
  // }

  // /**
  //  * Traverse *all* values of a {@link FormGroup}, including those for disabled fields (i.e. hidden ones), replacing the
  //  * value of any that are hidden AND have `retain_hidden_value` set to `true` in the corresponding `CaseField`, with
  //  * the *original* value held in the `CaseField` object.
  //  *
  //  * This is as per design in EUI-3622, where any user-driven updates to hidden fields with `retain_hidden_value` =
  //  * `true` are ignored (thus retaining the value displayed originally).
  //  *
  //  * * For Complex field types, the replacement above is performed recursively for all hidden sub-fields with
  //  * `retain_hidden_value` = `true`.
  //  *
  //  * * For Collection field types, including collections of Complex and Document field types, the replacement is
  //  * performed for all fields in the collection.
  //  *
  //  * @param formGroup The `FormGroup` instance whose raw values are to be traversed
  //  * @param caseFields The array of {@link CaseField} domain model objects corresponding to fields in `formGroup`
  //  * @param parentField Reference to the parent `CaseField`. Used for retrieving the sub-field values of a Complex field
  //  * to perform recursive replacement - the sub-field `CaseField`s themselves do *not* contain any values
  //  * @returns An object with the *raw* form value data (as key-value pairs), with any value replacements as necessary
  //  */
  // private replaceHiddenFormValuesWithOriginalCaseData(formGroup: FormGroup, caseFields: CaseField[], parentField?: CaseField): object {
  //   // Get the raw form value data, which includes the values of any disabled controls, as key-value pairs
  //   const rawFormValueData = formGroup.getRawValue();

  //   // Place all case fields in a lookup object, so they can be retrieved by id
  //   const caseFieldsLookup = {};
  //   for (let i = 0, len = caseFields.length; i < len; i++) {
  //     caseFieldsLookup[caseFields[i].id] = caseFields[i];
  //   }

  //   /**
  //    * Replace any form value with the original, where its CaseField is hidden AND has the retain_hidden_value flag set
  //    * to true.
  //    *
  //    * If the CaseField's `hidden` attribute is null or undefined, then check this attribute in the parent CaseField (if
  //    * one exists). This is occurring (and is possibly a bug) when a CaseField is a sub-field of a Complex type, or an
  //    * item in a Collection type.
  //    *
  //    * If the field is a Complex type with retain_hidden_value = true, perform a recursive replacement for all (hidden)
  //    * sub-fields with retain_hidden_value = true, using their original CaseField values (from the `formatted_value`
  //    * attribute).
  //    *
  //    * If the field is a Collection type with retain_hidden_value = true, the entire collection is replaced with the
  //    * original from `formatted_value`. This applies to *all* types of Collections.
  //    */
  //   Object.keys(rawFormValueData).forEach((key) => {
  //     const caseField: CaseField = caseFieldsLookup[key];
  //     // If caseField.hidden is NOT truthy and also NOT equal to false, then it must be null/undefined (remember that
  //     // both null and undefined are equal to *neither false nor true*)
  //     if (caseField && caseField.retain_hidden_value &&
  //       (caseField.hidden || (caseField.hidden !== false && parentField && parentField.hidden))) {
  //       if (caseField.field_type.type === 'Complex') {
  //         // Note: Deliberate use of equality (==) and non-equality (!=) operators for null checks throughout, to
  //         // handle both null and undefined values
  //         if (caseField.value != null) {
  //           // Call this function recursively to replace the Complex field's sub-fields as necessary, passing the
  //           // CaseField itself (the sub-fields do not contain any values, so these need to be obtained from the
  //           // parent)
  //           // Update rawFormValueData for this field
  //           // creating form group and adding control into it in case caseField is of complext type and and part of formGroup
  //           const form: FormGroup = new FormGroup({});
  //           if (formGroup.controls[key].value) {
  //             Object.keys(formGroup.controls[key].value).forEach((item) => {
  //               form.addControl(item, new FormControl(formGroup.controls[key].value[item]));
  //             });
  //           }
  //           rawFormValueData[key] = this.replaceHiddenFormValuesWithOriginalCaseData(
  //             form, caseField.field_type.complex_fields, caseField);
  //         }
  //       } else {
  //         // Default case also handles collections of *all* types; the entire collection in rawFormValueData will be
  //         // replaced with the original from formatted_value
  //         // Use the CaseField's existing *formatted_value* from the parent, if available. (This is necessary for
  //         // Complex fields, whose sub-fields do not hold any values in the model.) Otherwise, use formatted_value
  //         // from the CaseField itself.
  //         if (parentField && parentField.formatted_value) {
  //           rawFormValueData[key] = parentField.formatted_value[caseField.id];
  //         } else {
  //           rawFormValueData[key] = caseField.formatted_value;
  //         }
  //       }
  //     }
  //   });

  //   return rawFormValueData;
  // }

  // private caseSubmit({ form, caseEventData, caseEditState, submit }: CaseEditCaseSubmit ): void {
  //  submit(caseEventData)
  //     .subscribe(
  //       response => {
  //         this.caseNotifier.cachedCaseView = null;
  //         this.sessionStorageService.removeItem('eventUrl');
  //         const confirmation: Confirmation = this.buildConfirmation(response);
  //         if (confirmation && (confirmation.getHeader() || confirmation.getBody())) {
  //           this.confirm(confirmation);
  //         } else {
  //           this.updateSubmitResponse(response);
  //         }
  //       },
  //       error => {
  //         this.updateError(error);
  //         this.updateCallbackErrors(error);

  //         if (caseEditState.error.details) {
  //           this.formErrorService
  //             .mapFieldErrors(caseEditState.error.details.field_errors, form.controls['data'] as FormGroup, 'validation');
  //         }
  //         this.updateIsSubmitting(false);
  //       }
  //     );
  // }

  // public getStatus(response: object): any {
  //   return this.hasCallbackFailed(response) ? response['callback_response_status'] : response['delete_draft_response_status'];
  // }

  // private hasCallbackFailed(response: object): boolean {
  //   return response['callback_response_status'] !== 'CALLBACK_COMPLETED';
  // }

  // private buildConfirmation(response: object): Confirmation {
  //   if (response['after_submit_callback_response']) {
  //     return new Confirmation(
  //       response['id'],
  //       response['callback_response_status'],
  //       response['after_submit_callback_response']['confirmation_header'],
  //       response['after_submit_callback_response']['confirmation_body']
  //     );
  //   } else {
  //     return null;
  //   }
  // }

  // public getCaseId(caseDetails: CaseView): string {
  //   return (caseDetails ? caseDetails.case_id : '');
  // }

  // private getEventId(form: FormGroup): string {
  //   return form.value.event.id;
  // }

  // public onEventCanBeCompleted({ eventTrigger, eventCanBeCompleted, caseDetails, form, caseEditState, submit }: CaseEditonEventCanBeCompleted ): void {
  //   if (eventCanBeCompleted) {
  //     // Submit
  //     const caseEventData = this.generateCaseEventData({ eventTrigger, form, caseEditState });
  //     this.caseSubmit({ form, caseEventData, caseEditState, submit });
  //   } else {
  //     // Navigate to tasks tab on case details page
  //     this.router.navigate([`/cases/case-details/${this.getCaseId(caseDetails)}/tasks`], { relativeTo: this.route });
  //   }
  // }

  // private confirm(confirmation: Confirmation): Promise<boolean> {
  //   this.updateConfirmation(confirmation);
  //   return this.router.navigate(['confirm'], {relativeTo: this.route});
  // }
}
