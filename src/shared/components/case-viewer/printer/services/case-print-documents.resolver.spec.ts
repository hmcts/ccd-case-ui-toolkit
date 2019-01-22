import { CasePrintDocumentsResolver } from './case-print-documents.resolver';
import { Observable } from 'rxjs';
import createSpyObj = jasmine.createSpyObj;
import { CaseResolver } from '../../services';
import { CasePrintDocument, HttpError, CaseView } from '../../../../domain';

describe('CasePrintDocumentsResolver', () => {

  const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;
  const JURISDICTION = 'TEST';
  const CASE_TYPE = 'TestAddressBookCase';
  const CASE_ID = '42';
  const DOCUMENTS: CasePrintDocument[] = [
    {
      name: 'Doc1',
      type: 'application/pdf',
      url: 'https://test.service.reform.hmcts.net/doc1'
    }
  ];
  const DOCUMENTS_OBS: Observable<CasePrintDocument[]> = Observable.of(DOCUMENTS);
  const ERROR: HttpError = {
    timestamp: '',
    status: 422,
    message: 'Validation failed',
    error: '',
    exception: '',
    path: ''
  };
  const CASE: CaseView = {
    case_id: CASE_ID,
    case_type: {
      id: CASE_TYPE,
      name: '',
      jurisdiction: {
        id: JURISDICTION,
        name: ''
      }
    },
    state: null,
    channels: null,
    tabs: null,
    triggers: null,
    events: null
  };

  let documentsResolver: CasePrintDocumentsResolver;

  let casesService: any;
  let alertService: any;

  let route: any;

  let router: any;

  beforeEach(() => {
    casesService = createSpyObj('casesService', ['getPrintDocuments']);
    alertService = createSpyObj('alertService', ['error']);

    router = createSpyObj('router', ['navigate']);

    documentsResolver = new CasePrintDocumentsResolver(casesService, alertService);

    route = {
      paramMap: createSpyObj('paramMap', ['get']),
      parent: {
        data: {
          case: CASE
        }
      }
    };

    route.paramMap.get.and.callFake(key => {
      switch (key) {
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
  });

  it('should resolve documents using case service', () => {
    casesService.getPrintDocuments.and.returnValue(DOCUMENTS_OBS);

    documentsResolver
      .resolve(route)
      .subscribe(documentsData => {
        expect(documentsData).toBe(DOCUMENTS);
      });

    expect(casesService.getPrintDocuments).toHaveBeenCalledWith(JURISDICTION, CASE_TYPE, CASE_ID);
    expect(route.paramMap.get).not.toHaveBeenCalled();
  });

  it('should create error alert when documents cannot be retrieved', done => {
    casesService.getPrintDocuments.and.returnValue(Observable.throw(ERROR));

    documentsResolver
      .resolve(route)
      .subscribe(data => {
        fail(data);
      }, err => {
        expect(err).toBeTruthy();
        expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
        done();
      });
  });
});
