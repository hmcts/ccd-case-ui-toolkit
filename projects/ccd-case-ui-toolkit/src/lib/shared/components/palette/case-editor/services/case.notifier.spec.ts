import { CaseField, CaseTab, CaseView } from '../../../domain';
import { CaseNotifier } from './case.notifier';
import { CasesService } from './cases.service';

describe('setBasicFields', () => {
  let caseNotifier: CaseNotifier;
  let casesService: jasmine.SpyObj<CasesService>;
  const caseTab1 = new CaseTab();
  const caseTab2 = new CaseTab();
  const caseField1 = new CaseField();
  const caseField2 = new CaseField();
  const caseField3 = new CaseField();

  const CASE_VIEW: CaseView = {
    case_id: '1',
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
    events: []
  };

  beforeEach(() => {
    caseNotifier = new CaseNotifier(casesService);
    caseNotifier.cachedCaseView = CASE_VIEW;

    caseTab1.id = 'overview';
    caseTab1.fields = [];

    caseTab2.id = 'Something';
    caseTab2.fields = [];

    caseField1.id = CaseNotifier.CASE_NAME;
    caseField1.value = 'Case Name';

    caseField2.id = CaseNotifier.CASE_LOCATION;
    caseField2.value = { baseLocation : 22};

    caseField3.id = 'Something else';
    caseField3.value = 'Something else';
  });

  it('should be empty when tabs are not available', () => {
    caseNotifier.cachedCaseView.tabs = [];
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    expect(caseNotifier.cachedCaseView.basicFields).toBeUndefined();
  });

  it('should be empty when fields are not available', () => {
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    expect(caseNotifier.cachedCaseView.basicFields).toBeUndefined();
  });

  it('should be empty when other tabs and fields are available', () => {
    caseTab2.fields.push(caseField3);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    expect(caseNotifier.cachedCaseView.basicFields).toBeUndefined();
  });

  it('should have basic details when tabs are available', () => {
    caseTab1.fields.push(caseField1);
    caseTab1.fields.push(caseField2);
    caseNotifier.cachedCaseView.tabs.push(caseTab1);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    const basicFields = { caseNameHmctsInternal: 'Case Name', caseManagementLocation: { baseLocation : 22}}
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });

  it('should have Case Name bascic details when caseNameHmctsInternal field is available', () => {
    caseTab1.fields.push(caseField1);
    caseNotifier.cachedCaseView.tabs.push(caseTab1);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    const basicFields = { caseNameHmctsInternal: 'Case Name', caseManagementLocation: null}
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });

  it('should have location basic details when caseManagementLocation field is available', () => {
    caseTab1.fields.push(caseField2);
    caseNotifier.cachedCaseView.tabs.push(caseTab1);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    const basicFields = { caseNameHmctsInternal: null, caseManagementLocation: { baseLocation : 22}}
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });

});
