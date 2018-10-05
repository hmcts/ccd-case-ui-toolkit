import { Observable } from 'rxjs/Observable';
import { DocumentData } from '../../shared/domain/document/document-data.model';

export abstract class AbstractDocumentManagementService {

  abstract uploadFile(formData: FormData): Observable<DocumentData>;
}
