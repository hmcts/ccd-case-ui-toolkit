// tslint:disable:variable-name
import { CaseFileViewDocument } from './case-file-view-document.model';

export class CaseFileViewCategory {
  public category_id: string;
  public category_name: string;
  public category_order: number;
  public documents: CaseFileViewDocument[];
  public sub_categories: CaseFileViewCategory[];
}
