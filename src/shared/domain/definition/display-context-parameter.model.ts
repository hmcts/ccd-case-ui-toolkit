export class DisplayContextParameter {
  collection?: string[];
  dateTimeEntry?: string;
  dateTimeDisplay?: string;
  table?: string[];
}

export enum CRUD {
  allowInsert = "allowInsert",
  allowUpdate = "allowUpdate",
  allowDelete = "allowDelete",
  allowRead = "allowRead",
}
