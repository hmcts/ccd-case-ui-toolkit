import { QueryItemResponseStatus } from '../../../enums/query-item-response-status.enum';
import { CaseMessage, QueryMessageDocument } from '../../case-queries-collection.model';

export class QueryListItem implements CaseMessage {
  public id: string;
  public subject?: string;
  public name: string;
  public body: string;
  public attachments?: QueryMessageDocument[] = [];
  public isHearingRelated: string;
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

  public get responseStatus(): QueryItemResponseStatus {
    if (this.children?.length > 0) {
      return this.children.length % 2 === 1
        ? QueryItemResponseStatus.RESPONDED
        : QueryItemResponseStatus.Awaiting;
    }
    return QueryItemResponseStatus.Awaiting;
  }
}
