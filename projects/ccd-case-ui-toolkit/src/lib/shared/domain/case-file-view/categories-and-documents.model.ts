// tslint:disable:variable-name
import { CaseFileViewCategory } from './case-file-view-category.model';
import { CaseFileViewDocument } from './case-file-view-document.model';

/**
 * DTO to provide typing of the response from the CCD Data Store API for Categories and Documents data.
 * @see {@link https://tools.hmcts.net/confluence/x/0KSDX#CaseFileViewDocumentDataendpointLLD-SuccessResponsePayload} for full details
 */
export class CategoriesAndDocuments {
  public case_version: number;
  public categories: CaseFileViewCategory[];
  public uncategorised_documents: CaseFileViewDocument[];
}
