import { Document } from '../../../../domain/document/document-data.model';

export interface PartyMessage {
  id: string;
  subject?: string;
  body: string;
  attachments?: Document[];
  isHearingRelated: boolean;
  hearingDate?: Date;
  createdOn: Date;
  createdBy: string;
  parentId?: string;
}

export interface PartyMessages {
  partyName: string;
  roleOnCase: string;
  partyMessages: PartyMessage[];
}
