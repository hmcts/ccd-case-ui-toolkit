
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs-compat';
import { Confirmation, Wizard } from '../../components';
import { CaseEventData, CaseEventTrigger, CaseView, HttpError, Profile } from '../../domain';
interface CaseEditModel {
  wizard: Wizard;
  currentPageId: string;
  eventTrigger: CaseEventTrigger;
  form: FormGroup;
  eventCanBeCompleted: boolean;
  caseDetails: CaseView;
  caseEventData: CaseEventData;
  submit(caseEventData: CaseEventData, profile?: Profile): Observable<object>;
}

export interface CaseEditGetNextPage
  extends Pick<CaseEditModel, 'wizard' | 'currentPageId'| 'eventTrigger' | 'form'> {}

export interface CaseEditSubmitForm
  extends Pick<CaseEditModel, 'eventTrigger' | 'form' | 'caseDetails' | 'submit'>{}

export interface CaseEditGenerateCaseEventData
  extends Pick<CaseEditModel, 'eventTrigger' | 'form'>{}

export interface CaseEditCaseSubmit
  extends Pick<CaseEditModel, 'form' | 'caseEventData' | 'submit'> {}

export interface CaseEditonEventCanBeCompleted
  extends Pick<CaseEditModel, 'eventCanBeCompleted' | 'eventTrigger' | 'caseDetails' | 'form' | 'submit'>{}
