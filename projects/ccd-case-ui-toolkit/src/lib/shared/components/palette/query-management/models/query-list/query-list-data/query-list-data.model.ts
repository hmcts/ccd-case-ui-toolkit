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
    const queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      ...message.value,
      children: allMessages
        .filter((childMessage: QueryMessage) => childMessage.value.parentId === message.value.id)
        .map((childMessage: QueryMessage) => this.buildQueryListItem(childMessage, allMessages))
    });
    return queryListItem;
  }
}
