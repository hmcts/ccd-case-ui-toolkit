import { CaseViewEvent } from '../domain';

export let createCaseViewEvent = () => {
  const caseViewEvent = new CaseViewEvent();

  caseViewEvent.id = 5;
  caseViewEvent.timestamp = '2017-05-10T10:00:00Z';
  caseViewEvent.summary = 'Case updated again!';
  caseViewEvent.comment = 'Latest update';
  caseViewEvent.event_id = 'updateCase';
  caseViewEvent.event_name = 'Update a case';
  caseViewEvent.state_id = 'CaseUpdated';
  caseViewEvent.state_name = 'Case Updated';
  caseViewEvent.user_id = 0;
  caseViewEvent.user_last_name = 'smith';
  caseViewEvent.user_first_name = 'justin';

  return caseViewEvent;
};
