import { CaseView } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { launcherRouteCase } from './launchers.mock';

const caseView = (caseId: string, access: string): CaseView => ({
  case_id: caseId,
  case_type: {
    id: 'test-case',
    name: 'Test case',
    jurisdiction: { id: 'TEST', name: 'Test' }
  },
  state: { id: 'Open', name: 'Open' },
  channels: [],
  tabs: [],
  triggers: [],
  events: [],
  metadataFields: [{
    id: '[ACCESS_PROCESS]',
    value: access,
    field_type: { id: 'Text', type: 'Text', fixed_list_items: [] }
  }]
} as CaseView);

export const caseNotifierCases: Record<string, CaseView> = {
  challenged: caseView('2222333344445555', 'CHALLENGED'),
  '1111222233334444': Object.assign(caseView('1111222233334444', 'STANDARD'), launcherRouteCase),
  standard: caseView('4444333322221111', 'STANDARD')
};
