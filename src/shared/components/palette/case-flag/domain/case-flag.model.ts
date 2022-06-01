export interface FlagDetail {
  name: string;
  subTypeValue?: string;
  subTypeKey?: string;
  otherDescription?: string;
  flagComment?: string;
  dateTimeModified?: Date | string;
  dateTimeCreated: Date | string;
  path: string[];
  hearingRelevant: boolean | string;
  flagCode: string;
  status: string;
}

export interface Flags {
  flagsCaseFieldId?: string;
  partyName?: string;
  roleOnCase?: string;
  details?: FlagDetail[];
}

export interface FlagDetailDisplay {
  partyName: string;
  flagDetail: FlagDetail;
}
