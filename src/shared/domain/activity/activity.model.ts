export class ActivityInfo {
  forename: string;
  surname: string;
}

export class Activity {
  caseId: string;
  viewers: ActivityInfo[];
  editors: ActivityInfo[];
  unknownViewers: number;
  unknownEditors: number;
}

export enum DisplayMode {
  BANNER,
  ICON
}
