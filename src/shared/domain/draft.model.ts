import { CaseDetails } from './case-details.model';

export const DRAFT_PREFIX = 'DRAFT';
export const DRAFT_QUERY_PARAM = 'draft';
export class Draft {
  public static stripDraftId(draftId: string): string {
    return draftId.slice(DRAFT_PREFIX.length);
  }

  public static isDraft(id: string): boolean {
    return String(id).startsWith(DRAFT_PREFIX);
  }

  id: string;
  document?: CaseDetails;
  type?: string;
  created?: string;
  updated?: string;
}
