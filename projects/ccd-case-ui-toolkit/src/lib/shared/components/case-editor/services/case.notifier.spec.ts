import { CaseField, CaseTab, CaseView } from '../../../domain';
import { CaseNotifier } from './case.notifier';
import { CasesService } from './cases.service';
import { BehaviorSubject, of } from 'rxjs';

export function getMockCaseNotifier(caseView: CaseView = null): CaseNotifier {
  const cv: CaseView = {
    case_id: '1620409659381330',
    case_type: {
      id: 'CIVIL',
      name: '',
      jurisdiction: {
        id: 'CIVIL',
        name: '',
        description: ''
      }
    }
  } as CaseView;
  const mockCasesService = jasmine.createSpyObj<CasesService>('mockCasesService', ['getCaseView', 'getCaseViewV2']);
  mockCasesService.getCaseViewV2.and.returnValue(of(cv));
  const mockCaseNotifier = new CaseNotifier(mockCasesService);
  if (!caseView) caseView = cv;
  mockCaseNotifier.caseView = mockCaseNotifier.caseView = new BehaviorSubject(caseView).asObservable();
  return mockCaseNotifier;
}

describe('setBasicFields', () => {
  let caseNotifier: CaseNotifier;
  const casesService: jasmine.SpyObj<CasesService> = jasmine.createSpyObj<CasesService>('CasesService', ['getCaseViewV2']);
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

  const CASE_VIEW_2: CaseView = {
    case_id: '2',
    case_type: {
      id: 'TestAddressBookCase2',
      name: 'Test Address Book Case 2',
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

  xit ('should call getCaseV2 on refresh', () => {
    const csv: jasmine.SpyObj<CasesService> = jasmine.createSpyObj<CasesService>('CasesService', ['getCaseViewV2']);
    csv.getCaseViewV2.and.returnValue(CASE_VIEW_2);
    const cNote = new CaseNotifier(csv);
    cNote.fetchAndRefresh('1');
    expect(csv.getCaseViewV2).toHaveBeenCalled();
  });

  it('should be empty when cached case is removed', () => {
    expect(caseNotifier.cachedCaseView).toBeTruthy('CachedCaseView null before remove');
    caseNotifier.removeCachedCase();
    expect(caseNotifier.cachedCaseView).toBeNull('CachedCaseView not null after remove');
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
    const basicFields = { caseNameHmctsInternal: 'Case Name', caseManagementLocation: { baseLocation : 22}};
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });

  it('should have Case Name basic details when caseNameHmctsInternal field is available', () => {
    caseTab1.fields.push(caseField1);
    caseNotifier.cachedCaseView.tabs.push(caseTab1);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    const basicFields = { caseNameHmctsInternal: 'Case Name', caseManagementLocation: null};
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });

  it('should have location basic details when caseManagementLocation field is available', () => {
    caseTab1.fields.push(caseField2);
    caseNotifier.cachedCaseView.tabs.push(caseTab1);
    caseNotifier.setBasicFields(caseNotifier.cachedCaseView.tabs);
    const basicFields = { caseNameHmctsInternal: null, caseManagementLocation: { baseLocation : 22}};
    expect(caseNotifier.cachedCaseView.basicFields).toEqual(basicFields);
  });
});
