import { CaseQueriesCollection, QueryMessage } from '../../case-queries-collection.model';
import { QueryListItem } from '../query-list-item/query-list-item.model';

export class QueryListData {
  public partyName: string;
  public roleOnCase: string;
  public queries: QueryListItem[];

  constructor(caseQueriesCollection: CaseQueriesCollection) {
    this.partyName = caseQueriesCollection.partyName;
    this.roleOnCase = caseQueriesCollection.roleOnCase;
    // get the parent messages (messages without parentId) and add the children to them
    const parentMessages = caseQueriesCollection.caseMessages.filter((message: QueryMessage) => !message.value.parentId);
    this.queries = parentMessages.map((message: QueryMessage) => this.buildQueryListItem(message, caseQueriesCollection.caseMessages));
  }

  private buildQueryListItem(message: QueryMessage, allMessages: QueryMessage[]): QueryListItem {
    const childrenMessages = allMessages.filter(
      (childMessage: QueryMessage) => childMessage.value.parentId === message.value.id
    );

    const children: QueryListItem[] = childrenMessages.map((childMessage, index) => {
      const childItem = this.buildQueryListItem(childMessage, allMessages);
      childItem.messageIndexInParent = index; // Assign index for status logic
      return childItem;
    });

    const queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      ...message.value,
      children
    });

    return queryListItem;
  }
}
