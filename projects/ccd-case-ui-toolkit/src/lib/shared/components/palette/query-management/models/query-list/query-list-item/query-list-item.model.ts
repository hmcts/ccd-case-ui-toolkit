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
  public isClosed?: string;
  public children: QueryListItem[] = [];

  public messageIndexInParent?: number | null = null;

  public get lastSubmittedMessage(): QueryListItem {
    const getLastSubmittedMessage = (item: QueryListItem): QueryListItem => {
      let lastSubmittedMessage: QueryListItem = item;
      if (item.children && item.children.length > 1) {
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
    const childrenCount = this.children.length;
    if (childrenCount === 0) {
      return this.lastSubmittedMessage.name;
    }

    let index: number;

    if (childrenCount === 1) {
      index = 0;
    } else {
      index = childrenCount % 2 === 1 ? childrenCount - 1 : childrenCount - 2;
    }

    return this.children[index].name;
  }

  public get lastSubmittedDate(): Date {
    const childrenCount = this.children.length;
    if (childrenCount <= 1) {
      return new Date(this.lastSubmittedMessage.createdOn);
    }

    let index: number;

    if (childrenCount > 1) {
      index = childrenCount % 2 === 0 ? childrenCount - 1 : childrenCount - 2;
    }

    return new Date(this.children[index].createdOn);
  }

  public get lastResponseBy(): string {
    return this.children?.length > 0 ? this.lastSubmittedMessage.name : '';
  }

  public get lastResponseDate(): Date | null {
    const childrenCount = this.children.length;
    if (childrenCount === 0) {
      return null;
    }

    let index: number;

    if (childrenCount === 1) {
      index = 0;
    } else {
      index = childrenCount % 2 === 1 ? childrenCount - 1 : childrenCount - 2;
    }

    return new Date(this.children[index].createdOn);
  }

  public get responseStatus(): QueryItemResponseStatus {
    // Child logic (position-based)
    if (this.messageIndexInParent !== null) {
      return this.messageIndexInParent % 2 === 0
        ? QueryItemResponseStatus.RESPONDED
        : QueryItemResponseStatus.AWAITING;
    }

    // Parent logic (children count)
    if (this.children && this.children.length > 0) {
      return this.children.length % 2 === 1
        ? QueryItemResponseStatus.RESPONDED
        : QueryItemResponseStatus.AWAITING;
    }

    // No children — still awaiting
    return QueryItemResponseStatus.AWAITING;
  }
}
