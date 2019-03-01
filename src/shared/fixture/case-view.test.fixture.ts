import { createCaseTabArray } from './case-tab.test.fixture';
import { CaseView } from '../domain';
import { newCaseField } from './case-field.test.fixture';

export let createCaseView = () => {
  const caseView = new CaseView();
  caseView.case_id = '1234567890123456';
  caseView.case_type = {
    id: 'TestAddressBookCase',
    name: 'Test Address Book Case',
    jurisdiction: {
      id: 'TEST',
      name: 'Test',
    }
  };
  caseView.state = {
    id: 'CaseCreated',
    name: 'Case created'
  };

  caseView.tabs = createCaseTabArray();

  caseView.metadataFields = [
    newCaseField('[STATE]', 'State', null, null, 'READONLY', 2)
      .withValue('State1').withShowCondition('').build(),
  ];

  return caseView;
};
