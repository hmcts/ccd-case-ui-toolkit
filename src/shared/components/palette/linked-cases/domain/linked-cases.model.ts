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

export class LinkedCase {
  caseLink: CaseLink;
}

export class CaseLink {
  caseReference: string;
  linkReason: LinkReason[];
  createdDateTime: string;
  caseType: string;
}

export class LinkReason {
  reason: string;
  otherDescription?: string;
}
