import { CaseHistory, CaseHistoryCaseType } from '../components';
import { createJurisdiction } from './jurisdiction.test.fixture';
import { createCaseTabArray } from './case-tab.test.fixture';
import { createCaseViewEvent } from './case-view-event.test.fixture';


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
