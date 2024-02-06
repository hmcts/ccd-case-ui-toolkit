import { Injectable } from '@angular/core';
import { Document, FormDocument } from '../../../../domain';

@Injectable()
export class QueryManagementUtils {
  public static extractCaseQueriesFromCaseField(): void {

  }

  public static documentToCollectionFormDocument(document: Document): { id: string; value: FormDocument } {
    return {
      id: null,
      value: {
        document_filename: document.originalDocumentName,
        document_url: document._links.self.href,
        document_binary_url: document._links.binary.href
      }
    };
  }
}
