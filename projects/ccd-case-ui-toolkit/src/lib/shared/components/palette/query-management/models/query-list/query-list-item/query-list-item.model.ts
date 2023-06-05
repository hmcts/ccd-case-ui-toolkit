import { FormDocument } from '../../../../../../domain';
import { PartyMessage } from '../../party-messages/party-message.model';

export class QueryListItem implements PartyMessage {
  public id: string;
  public subject?: string;
  public name: string;
  public body: string;
  public attachments?: FormDocument[];
  public isHearingRelated: boolean;
  public hearingDate?: string;
  public createdOn: Date;
  public createdBy: string;
  public parentId?: string;
  public children: QueryListItem[] = [];

  public get lastSubmittedMessage(): QueryListItem {
    const getLastSubmittedMessage = (item: QueryListItem): QueryListItem => {
      let lastSubmittedMessage: QueryListItem = item;

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          const childLastSubmittedMessage = getLastSubmittedMessage(child);
          if (childLastSubmittedMessage.createdOn > lastSubmittedMessage.createdOn) {
            lastSubmittedMessage = childLastSubmittedMessage;
          }
        }
      }

      return lastSubmittedMessage;
    };

    return getLastSubmittedMessage(this);
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
}
