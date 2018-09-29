import { CaseDetails } from './case-details';

export class Draft {
  public static readonly DRAFT = 'DRAFT';

  id: string;
  document?: CaseDetails;
  type?: string;
  created?: string;
  updated?: string;

  public static stripDraftId(draftId: string): string {
    return draftId.slice(5);
  }

  public static isDraft(id: string): boolean {
    return String(id).startsWith(this.DRAFT);
  }

}
