import { User } from './user.model';

export class CaseActivityInfo {
  public caseId: string;
  public unknownViewers: number;
  public unknownEditors: number;
  public editors: User[];
  public viewers: User[];
}
