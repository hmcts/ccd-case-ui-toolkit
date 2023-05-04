export interface QueryDetail {
  name: string;
  lastSubmittedBy: string;
  lastSubmissionDate: Date;
  lastResponseBy?: string;
  lastResponseDate?: Date;
}

export interface Queries {
  partyName: string;
  queryDetails: QueryDetail[];
}
