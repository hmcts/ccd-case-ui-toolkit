export interface CaseMessage {
  id: string;
  subject: string;
  body: string;
  attachments?: string[];
  isHearingRelated: boolean;
  hearingDate?: Date;
  createdOn: Date;
  createdBy: string;
  parentId?: string;
}

export interface CaseQueries {
  partyName: string;
  caseMessages: CaseMessage[];
}
