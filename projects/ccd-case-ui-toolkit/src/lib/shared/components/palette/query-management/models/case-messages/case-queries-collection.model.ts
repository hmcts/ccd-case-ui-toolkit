import { CaseMessage } from './case-message.model';

export interface CaseQueriesCollection {
  partyName: string;
  roleOnCase: string;
  caseMessages: CaseMessage[];
}
