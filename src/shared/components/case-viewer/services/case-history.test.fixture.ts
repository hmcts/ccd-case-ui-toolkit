import { CaseHistory, CaseHistoryCaseType } from '../domain';
import { createJurisdiction, createCaseTabArray, createCaseViewEvent } from '../../../fixture';

export let createCaseHistory = () => {
  const caseHistory = new CaseHistory();
  const caseHistoryCaseType = new CaseHistoryCaseType();

  caseHistory.case_id = '1';

  caseHistoryCaseType.id = 'TestAddressBookCase';
  caseHistoryCaseType.name = 'Test Address Book Case';
  caseHistoryCaseType.jurisdiction = createJurisdiction();
  caseHistory.caseType = caseHistoryCaseType;

  caseHistory.tabs = createCaseTabArray();
  caseHistory.event = createCaseViewEvent();

  return caseHistory;
};
