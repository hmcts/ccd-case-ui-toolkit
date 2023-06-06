export class ActivityInfo {
  public id?: string;
  public forename: string;
  public surname: string;
}

export class Activity {
  public caseId: string;
  public viewers: ActivityInfo[];
  public editors: ActivityInfo[];
  public unknownViewers: number;
  public unknownEditors: number;
}

export enum DisplayMode {
  BANNER,
  ICON
}
