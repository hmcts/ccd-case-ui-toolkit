import { CaseQueriesCollection, QueryMessage } from '../../case-queries-collection.model';
import { QueryListItem } from '../query-list-item/query-list-item.model';

export class QueryListData {
  public partyName: string;
  public roleOnCase: string;
  public queries: QueryListItem[];

  constructor(caseQueriesCollection: CaseQueriesCollection) {
    this.partyName = caseQueriesCollection.partyName;
    this.roleOnCase = caseQueriesCollection.roleOnCase;

    console.log('PARTY NAME', this.partyName);
    console.log('ROLE ON CASE', this.roleOnCase);
    console.log('CASE MESSAGES',
      caseQueriesCollection.caseMessages[0],
      caseQueriesCollection.caseMessages[1],
      caseQueriesCollection.caseMessages[2],
      caseQueriesCollection.caseMessages[3],
      caseQueriesCollection.caseMessages[4]);

    // get the parent messages (messages without parentId) and add the children to them
    const parentMessages = caseQueriesCollection.caseMessages.filter((message: QueryMessage) => !message.value.parentId);
    this.queries = parentMessages.map((message: QueryMessage) => this.buildQueryListItem(message, caseQueriesCollection.caseMessages));
  }

  private buildQueryListItem(message: QueryMessage, allMessages: QueryMessage[]): QueryListItem {
    const queryListItem = new QueryListItem();
    Object.assign(queryListItem, {
      ...message,
      children: allMessages
        .filter((childMessage: QueryMessage) => childMessage.value.parentId === message.id)
        .map((childMessage: QueryMessage) => this.buildQueryListItem(childMessage, allMessages))
    });
    console.log('QUERY LIST ITEM', queryListItem);
    return queryListItem;
  }
}
