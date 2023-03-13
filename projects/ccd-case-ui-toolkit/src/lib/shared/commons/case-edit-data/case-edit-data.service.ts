import { FormGroup } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { LinkedCasesError } from '../../components/palette/linked-cases/domain/linked-cases-state.model';
import { CaseView } from '../../domain';
import { CaseEditValidationError } from './case-edit-validation.model';

export class CaseEditDataService {
  private details$ = new BehaviorSubject<CaseView>(null);
  private title$ = new BehaviorSubject<string>(null);
  private formValidationErrors$ = new BehaviorSubject<CaseEditValidationError[]>([]);
  private editForm$ = new BehaviorSubject<FormGroup>(null);
  private linkError$ = new BehaviorSubject<LinkedCasesError>(null);
  private eventTriggerName$ = new BehaviorSubject<string>(null);
  private triggerSubmitEvent$ = new BehaviorSubject<boolean>(null);

  public caseDetails$ = this.details$.asObservable();
  public caseTitle$ = this.title$.asObservable();
  public caseEditForm$ = this.editForm$.asObservable();
  public caseFormValidationErrors$ = this.formValidationErrors$.asObservable();
  public caseLinkError$ = this.linkError$.asObservable();
  public caseEventTriggerName$ = this.eventTriggerName$.asObservable();
  public caseTriggerSubmitEvent$ = this.triggerSubmitEvent$.asObservable();

  constructor() {}

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
}
