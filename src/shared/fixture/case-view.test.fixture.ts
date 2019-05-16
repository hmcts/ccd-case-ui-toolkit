import { createCaseTabArray } from './case-tab.test.fixture';
import { CaseField, CaseView } from '../domain';

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

  caseView.metadataFields = [<CaseField>({
    id: '[STATE]',
    label: 'State',
    display_context: 'READONLY',
    field_type: {
      id: 'Text',
      type: 'Text'
    },
    order: 2,
    value: 'State1',
    show_condition: ''
  })];

  return caseView;
};
