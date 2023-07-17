import { Document } from '../../../../../domain';

export interface CaseMessage {
  id: string;
  subject?: string;
  name: string;
  body: string;
  attachments?: Document[];
  isHearingRelated: boolean;
  hearingDate?: string;
  createdOn: Date;
  createdBy: string;
  parentId?: string;
}
