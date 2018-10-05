import { CaseDetails } from './case-details';

export const DRAFT = 'DRAFT';
export class Draft {

  id: string;
  document?: CaseDetails;
  type?: string;
  created?: string;
  updated?: string;

  public static stripDraftId(draftId: string): string {
    return draftId.slice(5);
  }

  public static isDraft(id: string): boolean {
    return String(id).startsWith(DRAFT);
  }

}
