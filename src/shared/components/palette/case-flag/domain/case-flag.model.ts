export interface FlagPath {
  id?: string;
  value: string;
}

export interface FlagDetail {
  id?: string;
  name: string;
  subTypeValue?: string;
  subTypeKey?: string;
  otherDescription?: string;
  flagComment?: string;
  dateTimeModified?: Date | string;
  dateTimeCreated: Date | string;
  path: FlagPath[];
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
  flagsCaseFieldId?: string;
}
