import { CaseView } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const caseView = (caseId: string, access: string): CaseView => ({
  case_id: caseId,
  metadataFields: [{ id: '[ACCESS_PROCESS]', value: access }]
} as CaseView);

export const serviceViewerCases = {
  challenged: caseView('1111222233334444', 'CHALLENGED'),
  standard: caseView('4444333322221111', 'STANDARD')
};
