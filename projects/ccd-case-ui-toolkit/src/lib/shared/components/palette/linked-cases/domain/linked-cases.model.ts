export class LinkCaseReason {
  public key: string;
  public value_en: string;
  public value_cy: string;
  public hint_text_en: string;
  public hint_text_cy: string;
  public lov_order: number;
  public parent_key: string;
  public category_key: string;
  public parent_category: string;
  public active_flag: string;
  public child_nodes: string;
  public from: string;
  public selected?: boolean;
}

export class CCDCaseLinkType {
  public CaseReference: string;
  public CaseType: string;
  public CreatedDateTime: string;
  public ReasonForLink: LinkReason[];
}

export class CaseLink {
  public caseReference: string;
  public reasons: LinkReason[];
  public createdDateTime: string;
  public caseType: string;
  public caseTypeDescription: string;
  public caseState: string;
  public caseStateDescription: string;
  public caseService: string;
  public caseName: string;
  public unlink?: boolean;
}

export class LinkReason {
  public Reason: string;
  public OtherDescription?: string;
}

export class LinkFromReason {
  public reasonCode: string;
  public otherDescription?: string;
}

export class LinkedCasesResponse {
  public linkedCases: CaseLinkResponse[];
}

export class CaseLinkResponse {
  public caseNameHmctsInternal: string;
  public caseReference: string;
  public ccdCaseType: string;
  public ccdCaseTypeDescription: string;
  public ccdJurisdiction: string;
  public state: string;
  public stateDescription: string;
  public linkDetails: LinkDetails[];
}

export class LinkDetails {
  public createdDateTime: Date;
  public reasons: LinkFromReason[];
}

export class Terms {
  public terms: {
    reference: any[];
  };
}

export class ESQueryType {
  public query: Terms;
  public size: number;
}
