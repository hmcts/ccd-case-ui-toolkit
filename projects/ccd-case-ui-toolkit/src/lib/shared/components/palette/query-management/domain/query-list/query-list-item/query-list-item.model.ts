import { Document } from '../../../../../../domain';
import { PartyMessage } from '../../party-messages/party-message.model';
import { QueryListResponseStatus } from '../query-list-response-status.enum';

export class QueryListItem implements PartyMessage {
  public id: string;
  public subject?: string;
  public name: string;
  public body: string;
  public attachments?: Document[];
  public isHearingRelated: boolean;
  public hearingDate?: string;
  public createdOn: Date;
  public createdBy: string;
  public parentId?: string;
  public children: PartyMessage[];

  private get lastSubmittedMessage(): PartyMessage {
    if (this.children && this.children.length > 0) {
      return this.children.reduce((prev, current) => {
        return (prev.createdOn > current.createdOn) ? prev : current;
      });
    } else {
      return this;
    }
  }

  public get lastSubmittedBy(): string {
    return this.lastSubmittedMessage.name;
  }

  public get lastSubmittedDate(): Date {
    return new Date(this.lastSubmittedMessage.createdOn);
  }

  public get lastResponseBy(): string {
    return this.children?.length > 0 ? this.lastSubmittedMessage.name : '';
  }

  public get lastResponseDate(): Date | null {
    return this.children?.length > 0 ? new Date(this.lastSubmittedMessage.createdOn) : null;
  }

  public get responseStatus(): QueryListResponseStatus {
    return this.children?.length > 0 ? QueryListResponseStatus.RESPONDED : QueryListResponseStatus.NEW;
  }
}
