import { FormDocument } from '../../../../domain';

export interface QueryMessageDocument {
  id: string;
  value: FormDocument;
}

export interface CaseMessage {
  id?: string;
  subject?: string;
  name: string;
  body: string;
  attachments?: QueryMessageDocument[];
  isHearingRelated: string;
  hearingDate?: string;
  createdOn: Date;
  createdBy: string;
  parentId?: string;
}

export interface QueryMessage {
  id?: string;
  value: CaseMessage;
}

export interface CaseQueriesCollection {
  partyName: string;
  roleOnCase: string;
  caseMessages: QueryMessage[];
}
