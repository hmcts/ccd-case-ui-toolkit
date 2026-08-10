import { User } from './user.model';

export class CaseActivityInfo {
  caseId: string;
  unknownViewers: number;
  unknownEditors: number;
  editors: User[];
  viewers: User[];
}
