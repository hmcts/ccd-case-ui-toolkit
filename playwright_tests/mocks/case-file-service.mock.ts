import { of, throwError } from 'rxjs';
import { CaseFileViewService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/case-file-view/case-file-view.service';
import { categoriesAndDocumentsTestData } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/case-file-view/test-data/categories-and-documents-test-data';

export const caseFileViewService: Pick<CaseFileViewService, 'getCategoriesAndDocuments' | 'updateDocumentCategory'> = {
  getCategoriesAndDocuments: () => {
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get('case-file');
    if (scenario === 'unavailable') {
      return throwError(() => ({ status: 503 }));
    }
    if (scenario === 'empty') {
      return of({ case_version: 1, categories: [], uncategorised_documents: [] });
    }
    const data = structuredClone(categoriesAndDocumentsTestData);
    const document = data.categories[0].documents[0];
    document.attribute_path = 'caseDocuments.0.document';
    if (scenario === 'actions') {
      document.document_binary_url = `${window.location.origin}/test/toolkit.pdf`;
      document.document_filename = 'Lager encyclopedia.pdf';
      document.content_type = 'application/pdf';
    }
    if (scenario === 'print') {
      document.document_binary_url = `${window.location.origin}/test/printable.html`;
      document.document_filename = 'Printable document.html';
      document.content_type = 'text/html';
    }
    if (scenario === 'html') {
      document.document_binary_url = 'https://document.example/documents/lager/history.html';
      document.document_filename = 'Lager history.html';
      document.content_type = 'text/html';
    }
    const update = sessionStorage.getItem('case-file-update');
    if (params.has('case-file-move-success') && update) {
      const { category } = JSON.parse(update);
      const destination = data.categories.find((item) => item.category_id === category);
      if (destination) {
        data.categories[0].documents.shift();
        destination.documents.push(document);
        data.case_version++;
      }
    }
    return of(data);
  },
  updateDocumentCategory: (caseId, version, attributePath, category) => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('case-file-move-failure')) {
      return throwError(() => ({ status: 503 }));
    }
    if (params.has('case-file-move-success')) {
      sessionStorage.setItem('case-file-update', JSON.stringify({ caseId, version, attributePath, category }));
      return of({ response: true } as any);
    }
    return of(null);
  }
};
