export class LinkCaseReason {
  key: string;
  value_en: string;
  value_cy: string;
  hint_text_en: string;
  hint_text_cy: string;
  lov_order: number;
  parent_key: string;
  category_key: string;
  parent_category: string;
  active_flag: string;
  child_nodes: string;
  from: string;
  selected?: boolean;
}

export class CCDCaseLinkType {
  CaseReference: string;
  CaseType: string;
  CreatedDateTime: string
  ReasonForLink: LinkReason[];
}

export class CaseLink {
  caseReference: string;
  reasons: LinkReason[];
  createdDateTime: string;
  caseType: string;
  caseTypeDescription: string;
  caseState: string;
  caseStateDescription: string;
  caseService: string;
  caseName: string;
  unlink?: boolean;
}

export class LinkReason {
  Reason: string;
  OtherDescription?: string;
}

export class LinkedCasesResponse {
  linkedCases: CaseLinkResponse[];
}

export class CaseLinkResponse {
  caseNameHmctsInternal: string;
  caseReference: string;
  ccdCaseType: string;
  ccdCaseTypeDescription: string;
  ccdJurisdiction: string;
  state: string;
  stateDescription: string;
  linkDetails: LinkDetails[];
}

export class LinkDetails {
  createdDateTime: Date;
  reasons: LinkReason[];
}

export class Terms {
  terms: {
    reference: any[];
  }
}

export class ESQueryType {
  query: Terms;
  size: number;
}
