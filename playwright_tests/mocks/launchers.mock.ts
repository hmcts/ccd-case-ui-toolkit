import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const launcher = (id: string, argument: string) => Object.assign(new CaseField(), {
  id,
  label: id,
  display_context: 'OPTIONAL',
  display_context_parameter: `#ARGUMENT(${argument})`,
  field_type: { id: 'ComponentLauncher', type: 'ComponentLauncher' },
  value: null,
  acls: []
});

export const caseFileLauncher = launcher('case-file-launcher', 'CaseFileView');
export const waysToPayField = Object.assign(new CaseField(), {
  id: 'ways-to-pay',
  label: 'Ways to pay',
  display_context: 'READONLY',
  field_type: { id: 'WaysToPay', type: 'WaysToPay' },
  value: null
});
export const unsupportedLauncher = launcher('unsupported-launcher', 'UnknownMiniApp');

export const caseHistoryField = Object.assign(new CaseField(), {
  id: 'case-history', label: 'Case history', display_context: 'READONLY',
  field_type: { id: 'CaseHistoryViewer', type: 'CaseHistoryViewer' },
  value: [{ id: 'event-1', event_name: 'Case created', state_id: 'Open', timestamp: '2025-01-02T10:00:00.000', user_first_name: 'Case', user_last_name: 'Worker' }]
});

export const caseFlagsLauncher = Object.assign(new CaseField(), {
  id: 'case-flags-launcher', label: 'Case flags', display_context: 'READONLY',
  display_context_parameter: '#ARGUMENT(READ)', field_type: { id: 'FlagLauncher', type: 'FlagLauncher' }, value: null
});

export const queryManagementLauncher = launcher('query-management-launcher', 'QueryManagement');
export const linkedCasesLauncher = launcher('linked-cases-launcher', 'LinkedCases');

const linkedCasesField = Object.assign(new CaseField(), {
  id: 'caseLinks', label: 'Linked cases', display_context: 'READONLY',
  field_type: { id: 'Collection', type: 'Collection', collection_field_type: { id: 'CaseLink', type: 'Complex', complex_fields: [] } },
  value: [{ id: '2222333344445555', value: {
    CaseReference: '2222333344445555',
    ReasonForLink: [{ id: 'reason-1', value: { Reason: 'CLRC015' } }]
  } }]
});

export const launcherRouteCase = {
  tabs: [{
    id: 'launchers', label: 'Launchers', fields: [
      caseFlagsLauncher,
      Object.assign(new CaseField(), {
        id: 'caseFlags', display_context: 'READONLY', field_type: { id: 'Flags', type: 'Complex' },
        value: { details: [{ id: 'flag-1', value: { name: 'Reasonable adjustment', flagComment: 'Interpreter required', dateTimeCreated: '2025-01-01T00:00:00.000', dateTimeModified: '2025-01-01T00:00:00.000', hearingRelevant: 'No', status: 'Active' } }] }
      }),
      queryManagementLauncher,
      Object.assign(new CaseField(), {
        id: 'CaseQueriesCollection', display_context: 'OPTIONAL', field_type: { id: 'CaseQueriesCollection', type: 'Complex' },
        value: {
          partyName: 'Applicant',
          roleOnCase: 'Applicant',
          caseMessages: [
            { id: 'query-1', value: { id: 'query-1', subject: 'Evidence request', name: 'Caseworker', body: 'Please provide evidence', isHearingRelated: 'No', createdOn: '2025-01-01T10:00:00.000', createdBy: 'caseworker', attachments: [] } },
            { id: 'query-1-response', value: { id: 'query-1-response', parentId: 'query-1', messageType: 'Respond', name: 'HMCTS responder', body: 'Evidence received', isHearingRelated: 'No', createdOn: '2025-01-02T10:00:00.000', createdBy: 'hmcts', attachments: [] } },
            { id: 'query-2', value: { id: 'query-2', subject: 'Closed evidence request', name: 'Caseworker', body: 'This query is closed', isHearingRelated: 'No', createdOn: '2025-01-03T10:00:00.000', createdBy: 'caseworker', attachments: [] } },
            { id: 'query-2-response', value: { id: 'query-2-response', parentId: 'query-2', messageType: 'Respond', isClosed: 'Yes', name: 'HMCTS responder', body: 'The query has been closed', isHearingRelated: 'No', createdOn: '2025-01-04T10:00:00.000', createdBy: 'hmcts', attachments: [] } }
          ]
        }
      })
    ]
  }]
};

export const linkedCasesRouteCase = {
  ...launcherRouteCase,
  case_id: '1111222233334444',
  case_type: { id: 'TestCase', name: 'Test case', jurisdiction: { id: 'TEST', description: 'Test service' } },
  tabs: launcherRouteCase.tabs.map((tab) => ({
    ...tab,
    fields: [...tab.fields, linkedCasesLauncher, linkedCasesField]
  }))
};
