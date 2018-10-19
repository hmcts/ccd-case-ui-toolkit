import { CaseDetails } from './case-details';

export const DRAFT_PREFIX = 'DRAFT';
export const DRAFT_QUERY_PARAM = 'draft';
export class Draft {

  id: string;
  document?: CaseDetails;
  type?: string;
  created?: string;
  updated?: string;

  public static stripDraftId(draftId: string): string {
    return draftId.slice(DRAFT_PREFIX.length);
  }

  public static isDraft(id: string): boolean {
    return String(id).startsWith(DRAFT_PREFIX);
  }

}
