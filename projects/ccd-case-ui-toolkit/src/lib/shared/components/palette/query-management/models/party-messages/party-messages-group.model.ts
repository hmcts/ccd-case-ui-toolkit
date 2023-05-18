import { PartyMessage } from './party-message.model';

export interface PartyMessagesGroup {
  partyName: string;
  roleOnCase: string;
  partyMessages: PartyMessage[];
}
