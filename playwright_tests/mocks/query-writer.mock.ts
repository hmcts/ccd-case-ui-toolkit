import { CaseEventTrigger } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/domain';

export const queryWriterMessage = {
  id: 'writer-query', subject: 'Evidence required', name: 'Applicant', body: 'Please explain the evidence',
  isHearingRelated: 'No', hearingDate: null, createdOn: new Date('2025-01-01T10:00:00.000Z'), createdBy: 'applicant', attachments: []
};
export const queryWriterCollection = {
  partyName: 'Applicant', roleOnCase: 'Applicant', caseMessages: [{ id: 'writer-query', value: queryWriterMessage }, ...(new URLSearchParams(window.location.search).get('query-write') === 'followup' ? [{
    id: 'writer-response', value: { ...queryWriterMessage, id: 'writer-response', parentId: 'writer-query',
      body: 'Please provide further details', messageType: 'Respond', createdBy: 'staff', createdOn: new Date('2025-01-02T10:00:00.000Z') }
  }] : [])]
};
export const queryWriterEvent = {
  case_fields: [{ id: 'CaseQueriesCollection', display_context: 'OPTIONAL',
    field_type: { id: 'CaseQueriesCollection', type: 'Complex' }, value: queryWriterCollection }]
} as unknown as CaseEventTrigger;
