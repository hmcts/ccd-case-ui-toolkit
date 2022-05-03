export interface FlagDetail {
  name: string;
  subTypeValue?: string;
  subTypeKey?: string;
  otherDescription?: string;
  flagComment?: string;
  dateTimeModified?: Date;
  dateTimeCreated: Date;
  path: string[];
  hearingRelevant: boolean;
  flagCode: string;
  status: string;
}

export interface Flags {
  partyName?: string;
  roleOnCase?: string;
  details?: FlagDetail[];
}
