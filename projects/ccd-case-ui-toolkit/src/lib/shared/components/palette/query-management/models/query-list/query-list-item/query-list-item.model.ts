import { QueryCreateContext } from '../..';
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
  public messageType?: string;
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

    return this.children[childrenCount - 1].name;
  }

  public get lastSubmittedDate(): Date {
    const childrenCount = this.children.length;
    const lastChild = this.children[childrenCount - 1];

    // 1. Check for legacy: <= 1 child with no messageType
    const allChildrenLackMessageType = this.children.every(
      (child) => !child.messageType
    );
    if (childrenCount <= 1 && allChildrenLackMessageType) {
      return new Date(this.lastSubmittedMessage.createdOn);
    }

    // 2. Check if any RESPOND exists
    const hasRespond = this.children.some(
      (child) => child.messageType === QueryCreateContext.RESPOND
    );

    // 3. Check if all children are FOLLOWUPs and none are RESPONDs
    const onlyFollowUps = this.children.every(
      (child) => child.messageType === QueryCreateContext.FOLLOWUP
    );

    if (onlyFollowUps && !hasRespond) {
      return new Date(lastChild.createdOn);
    }

    // 4. If RESPOND exists, get latest FOLLOWUP
    // If no RESPOND, but there is at least one FOLLOWUP, return the last FOLLOWUP
    const lastFollowUp = [...this.children]
      .reverse()
      .find((child) => child.messageType === QueryCreateContext.FOLLOWUP);

    if (lastFollowUp) {
      return new Date(lastFollowUp.createdOn);
    }

    // 5. Legacy fallback: no messageType at all
    if (allChildrenLackMessageType) {
      const index = childrenCount % 2 === 0 ? childrenCount - 1 : childrenCount - 2;
      return new Date(this.children[index]?.createdOn);
    }

    // 6. Final fallback: return last child's date
    return new Date(this.lastSubmittedMessage.createdOn);
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
    const isThreadClosed = (item: QueryListItem): boolean => {
      if (item.isClosed === 'Yes') {
        return true;
      }
      return item.children?.some((child) => isThreadClosed(child)) || false;
    };

    if (isThreadClosed(this)) {
      return QueryItemResponseStatus.CLOSED;
    }

    const lastMessageType = this.children?.length
      ? this.children[this.children.length - 1]?.messageType
      : undefined;

    if (lastMessageType && lastMessageType === QueryCreateContext.RESPOND) {
      return QueryItemResponseStatus.RESPONDED;
    } else if (lastMessageType && lastMessageType === QueryCreateContext.FOLLOWUP) {
      return QueryItemResponseStatus.AWAITING;
    }

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
