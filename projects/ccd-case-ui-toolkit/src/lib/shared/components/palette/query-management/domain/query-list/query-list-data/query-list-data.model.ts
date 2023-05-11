import { PartyMessage } from '../../party-messages/party-message.model';
import { PartyMessagesGroup } from '../../party-messages/party-messages-group.model';
import { QueryListItem } from '../query-list-item/query-list-item.model';

export class QueryListData {
  public partyName: string;
  public roleOnCase: string;
  public partyMessages: QueryListItem[];

  constructor(partyMessagesGroup: PartyMessagesGroup) {
    this.partyName = partyMessagesGroup.partyName;
    this.roleOnCase = partyMessagesGroup.roleOnCase;

    // get the parent messages (messages without parentId) and add the children to them
    const parentMessages = partyMessagesGroup.partyMessages.filter((message: PartyMessage) => !message.parentId);
    this.partyMessages = parentMessages.map((message: PartyMessage) => {
      const parentMessage = new QueryListItem();
      Object.assign(parentMessage, {
        ...message,
        children: partyMessagesGroup.partyMessages
          .filter((childMessage: PartyMessage) => childMessage.parentId === message.id)
      });

      return parentMessage;
    });
  }
}
