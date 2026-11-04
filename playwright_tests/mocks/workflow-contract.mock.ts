import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { launcherRouteCase, linkedCasesLauncher, linkedCasesRouteCase, queryManagementLauncher } from './launchers.mock';

export const workflowQueryCase = {
  ...launcherRouteCase,
  tabs: launcherRouteCase.tabs.map((tab) => ({
    ...tab, fields: tab.fields.map((field) => Object.assign(new CaseField(), field, { value: structuredClone(field.value) }))
  })),
  case_type: { id: 'TestCase', jurisdiction: { id: 'TEST' } }
};
const collection = workflowQueryCase.tabs[0].fields.find((field) => field.id === 'CaseQueriesCollection');
collection.value.caseMessages.push(
  { id: 'pending', value: {
    id: 'pending', subject: 'Awaiting hearing answer', name: 'Applicant', body: 'Confirm the hearing arrangements',
    isHearingRelated: 'Yes', hearingDate: '2025-05-12', createdOn: '2025-02-01T10:00:00.000', createdBy: 'applicant',
    attachments: [{ id: 'hearing-document', value: {
      document_url: '/documents/hearing', document_binary_url: '/documents/hearing/binary', document_filename: 'hearing-notice.pdf'
    } }]
  } },
  { id: 'followup', value: {
    id: 'followup', parentId: 'query-1', messageType: 'Followup', name: 'Applicant', body: 'Please confirm receipt date',
    isHearingRelated: 'No', createdOn: '2025-02-02T10:00:00.000', createdBy: 'applicant', attachments: []
  } }
);
export const workflowQueryLauncher = Object.assign(new CaseField(), queryManagementLauncher);

export const workflowLinkedCase = {
  ...linkedCasesRouteCase,
  tabs: linkedCasesRouteCase.tabs.map((tab) => ({
    ...tab, fields: tab.fields.map((field) => Object.assign(new CaseField(), field, { value: structuredClone(field.value) }))
  }))
};
workflowLinkedCase.tabs[0].fields.find((field) => field.id === 'caseLinks').value = [];
export const workflowLinkedLauncher = Object.assign(new CaseField(), linkedCasesLauncher);
