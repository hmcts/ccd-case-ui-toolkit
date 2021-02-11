import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { AbstractAppConfig } from '../../../../app.config';
import { CaseEventData, CaseEventTrigger, CaseField, CaseView, HttpError } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture/shared.test.fixture';
import { HttpErrorService, HttpService } from '../../../services';
import { CasesService } from './cases.service';
import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';
import { WorkAllocationService } from './work-allocation.service';

import createSpyObj = jasmine.createSpyObj;

describe('CasesService', () => {

  const API_URL = 'http://aggregated.ccd.reform';
  const JID = 'TEST';
  const CTID = 'TestAddressBookCase';
  const CTID_UNDEFINED = undefined;
  const CASE_ID = '1';
  const CASE_ID_UNDEFINED = undefined;
  const PAGE_ID = 'pageId';
  const DRAFT_ID = 'DRAFT1';
  const CASE_URL = `${API_URL}/caseworkers/:uid/jurisdictions/${JID}/case-types/${CTID}/cases/${CASE_ID}`;
  const V2_CASE_VIEW_URL = `${API_URL}/internal/cases/${CASE_ID}`;
  const EVENT_TRIGGER_ID = 'enterCaseIntoLegacy';
  const EVENT_TRIGGER_FOR_CASE_TYPE_URL = API_URL + `/internal/case-types/${CTID}/event-triggers/${EVENT_TRIGGER_ID}?ignore-warning=true`;
  const EVENT_TRIGGER_FOR_CASE_URL = API_URL + `/internal/cases/${CASE_ID}/event-triggers/${EVENT_TRIGGER_ID}?ignore-warning=true`;
  const EVENT_TRIGGER_DRAFT_URL = API_URL + `/internal/drafts/${DRAFT_ID}/event-trigger?ignore-warning=true`;
  const CREATE_EVENT_URL = API_URL + `/cases/${CASE_ID}/events`;
  const VALIDATE_CASE_URL = API_URL + `/case-types/${CTID}/validate?pageId=${PAGE_ID}`;
  const PRINT_DOCUMENTS_URL = API_URL + `/cases/${CASE_ID}/documents`;
  const CREATE_CASE_URL = API_URL + `/case-types/${CTID}/cases?ignore-warning=false`;
  const CASE_VIEW: CaseView = {
    case_id: '1',
    case_type: {
      id: 'TestAddressBookCase',
      name: 'Test Address Book Case',
      jurisdiction: {
        id: 'TEST',
        name: 'Test',
      }
    },
    channels: [],
    state: {
      id: 'CaseCreated',
      name: 'Case created'
    },
    tabs: [],
    triggers: [],
    events: []
  };
  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let orderService: any;
  let errorService: any;
  let wizardPageFieldToCaseFieldMapper: any;
  let casesService: CasesService;
  let workAllocationService: WorkAllocationService;
  let alertService: any;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl']);
    appConfig.getApiUrl.and.returnValue(API_URL);
    appConfig.getCaseDataUrl.and.returnValue(API_URL);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);

    httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
    wizardPageFieldToCaseFieldMapper = createSpyObj<WizardPageFieldToCaseFieldMapper>(
      'wizardPageFieldToCaseFieldMapper', ['mapAll']);

    orderService = {
      sort: function() {}
    };
    spyOn(orderService, 'sort').and.callFake((caseFields: CaseField[]) => {
      return caseFields;
    });
    alertService = jasmine.createSpyObj('alertService', ['clear', 'warning']);

    workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);
    casesService = new CasesService(
      httpService, appConfig, orderService, errorService, wizardPageFieldToCaseFieldMapper, workAllocationService
    );
  });

  describe('getCaseView()', () => {

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(CASE_VIEW));
    });

    it('should use HttpService::get with correct url', () => {
      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(CASE_URL);
    });

    it('should retrieve case from server', () => {
      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe(
          caseData => expect(caseData).toEqual(CASE_VIEW)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(throwError(ERROR));

      casesService
        .getCaseView(JID, CTID, CASE_ID)
        .subscribe(data => {
          expect(data).toEqual(CASE_VIEW);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

  });

  describe('getCaseViewV2()', () => {

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(CASE_VIEW));
    });

    it('should use HttpService::get with correct url', () => {
      casesService
        .getCaseViewV2(CASE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(V2_CASE_VIEW_URL, {
        headers: new HttpHeaders()
          .set('experimental', 'true')
          .set('Accept', CasesService.V2_MEDIATYPE_CASE_VIEW)
          .set('Content-Type', 'application/json'),
        observe: 'body'
      });
    });

    it('should retrieve case from server', () => {
      casesService
        .getCaseViewV2(CASE_ID)
        .subscribe(
          caseData => expect(caseData).toEqual(CASE_VIEW)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(throwError(ERROR));

      casesService
        .getCaseViewV2(CASE_ID)
        .subscribe(data => {
          expect(data).toEqual(CASE_VIEW);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

  });

  describe('getEventTrigger()', () => {

    const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger('', '', '', false, []);

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(EVENT_TRIGGER));
    });

    it('should use HttpService::get with correct url for create case', () => {
      casesService
        .getEventTrigger(CTID, EVENT_TRIGGER_ID, CASE_ID_UNDEFINED, 'true')
        .subscribe();

      const headers = new HttpHeaders()
        .set('experimental', 'true')
        .set('Content-Type', 'application/json')
        .set('Accept', CasesService.V2_MEDIATYPE_START_CASE_TRIGGER);
      expect(httpService.get).toHaveBeenCalledWith(EVENT_TRIGGER_FOR_CASE_TYPE_URL, {headers, observe: 'body'});
    });

    it('should use HttpService::get with correct url for create event', () => {
      casesService
        .getEventTrigger(CTID_UNDEFINED, EVENT_TRIGGER_ID, CASE_ID, 'true')
        .subscribe();

      const headers = new HttpHeaders()
        .set('experimental', 'true')
        .set('Content-Type', 'application/json')
        .set('Accept', CasesService.V2_MEDIATYPE_START_EVENT_TRIGGER);
      expect(httpService.get).toHaveBeenCalledWith(EVENT_TRIGGER_FOR_CASE_URL, {headers, observe: 'body'});
    });

    it('should use HttpService::get with correct url for DRAFTS', () => {
      casesService
        .getEventTrigger(CTID, EVENT_TRIGGER_ID, DRAFT_ID, 'true')
        .subscribe();

      const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Content-Type', 'application/json')
      .set('Accept', CasesService.V2_MEDIATYPE_START_DRAFT_TRIGGER);
      expect(httpService.get).toHaveBeenCalledWith(EVENT_TRIGGER_DRAFT_URL, {headers, observe: 'body'});
    });

    it('should retrieve event trigger from server by case id', () => {
      casesService
        .getEventTrigger(CTID, EVENT_TRIGGER_ID, CASE_ID, 'true')
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(EVENT_TRIGGER)
        );
    });

    it('should retrieve event trigger from server by case type id', () => {
      casesService
        .getEventTrigger(CTID, EVENT_TRIGGER_ID, 'true')
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(EVENT_TRIGGER)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(throwError(ERROR));

      casesService
        .getEventTrigger(CTID, EVENT_TRIGGER_ID, 'true')
        .subscribe(data => {
          expect(data).toEqual(EVENT_TRIGGER);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('createEvent()', () => {
    const CASE_DETAILS: CaseView = {
      case_id: CASE_ID,
      case_type: {
        id: CTID,
        name: 'Test Address Book Case',
        jurisdiction: {
          id: JID,
          name: 'Test',
        }
      },
      channels: [],
      state: {
        id: 'CaseCreated',
        name: 'Case created'
      },
      tabs: [],
      triggers: [],
      events: []
    };

    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description'
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const EVENT_RESPONSE = { id: 5 };
    const EMPTY_RESPONSE = { id: '' };
    const HEADERS = new HttpHeaders()
      .set('content-type', CasesService.V2_MEDIATYPE_CREATE_EVENT);

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of({
        headers: HEADERS,
        body: EVENT_RESPONSE
      }));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe();
      const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_EVENT)
      .set('Content-Type', 'application/json');

      expect(httpService.post).toHaveBeenCalledWith(CREATE_EVENT_URL, CASE_EVENT_DATA, {headers, observe: 'body'});
    });

    it('should create event on server', () => {
      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(
          data => expect((data as any).body).toEqual(EVENT_RESPONSE)
        );
    });

    it('should return body with empty id if no content-type response header', () => {
      httpService.post.and.returnValue(Observable.of(EVENT_RESPONSE));

      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EMPTY_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(throwError(ERROR));

      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(EVENT_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('validateCase()', () => {
    const CASE_DETAILS: CaseView = {
      case_id: CASE_ID,
      case_type: {
        id: CTID,
        name: 'Test Address Book Case',
        jurisdiction: {
          id: JID,
          name: 'Test',
        }
      },
      channels: [],
      state: {
        id: 'CaseCreated',
        name: 'Case created'
      },
      tabs: [],
      triggers: [],
      events: []
    };

    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description'
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const EVENT_RESPONSE = { id: 5 };

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(EVENT_RESPONSE));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .validateCase(CTID, CASE_EVENT_DATA, PAGE_ID)
        .subscribe();

      const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DATA_VALIDATE)
      .set('Content-Type', 'application/json');

      expect(httpService.post).toHaveBeenCalledWith(VALIDATE_CASE_URL, CASE_EVENT_DATA, {headers, observe: 'body'});
    });

    it('should validate case on server', () => {
      casesService
        .validateCase(CTID, CASE_EVENT_DATA, PAGE_ID)
        .subscribe(
          data => expect(data).toEqual(EVENT_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(throwError(ERROR));

      casesService
        .createEvent(CASE_DETAILS, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(EVENT_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('createCase()', () => {
    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description',
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const CASE_RESPONSE = { id: 5 };
    const EMPTY_RESPONSE = { id: '' };
    const HEADERS = new HttpHeaders()
      .set('content-type', 'application/json;charset=UTF-8');

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of({
        headers: HEADERS,
        body: CASE_RESPONSE
      }));
    });

    it('should use HttpService::post with correct url', () => {
      casesService
        .createCase(CTID, CASE_EVENT_DATA)
        .subscribe();

      const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CREATE_CASE)
      .set('Content-Type', 'application/json');

      expect(httpService.post).toHaveBeenCalledWith(CREATE_CASE_URL, CASE_EVENT_DATA, {headers, observe: 'body'});
    });

    it('should create case on server', () => {
      casesService
        .createCase(CTID, CASE_EVENT_DATA)
        .subscribe(
          data => expect((data as any).body).toEqual(CASE_RESPONSE)
        );
    });

    it('should return body with empty id if no content-type response header', () => {
      httpService.post.and.returnValue(Observable.of(CASE_RESPONSE));

      casesService
        .createCase(CTID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(EMPTY_RESPONSE)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.post.and.returnValue(throwError(ERROR));

      casesService
        .createCase(CTID, CASE_EVENT_DATA)
        .subscribe(data => {
          expect(data).toEqual(CASE_RESPONSE);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('getPrintDocuments()', () => {

    const DOCUMENTS = {
      documentResources: [
        {
          name: 'Doc1',
          type: 'application/pdf',
          url: 'https://test.service.reform.hmcts.net/doc1'
        }
      ]
    };

    const HEADERS = new HttpHeaders()
      .set('content-type', CasesService.V2_MEDIATYPE_CASE_DOCUMENTS);

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(DOCUMENTS));
    });

    it('should use HttpService::get with correct url', () => {
      const headers = new HttpHeaders()
      .set('experimental', 'true')
      .set('Accept', CasesService.V2_MEDIATYPE_CASE_DOCUMENTS)
      .set('Content-Type', 'application/json');

      casesService
        .getPrintDocuments(CASE_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(PRINT_DOCUMENTS_URL, {headers, observe: 'body'});
    });

    it('should retrieve document list from server', () => {
      casesService
        .getPrintDocuments(CASE_ID)
        .subscribe(
          eventTrigger => expect(eventTrigger).toEqual(DOCUMENTS.documentResources)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(throwError(ERROR));

      casesService
        .getPrintDocuments(CASE_ID)
        .subscribe(data => {
          expect(data).toEqual(DOCUMENTS.documentResources);
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('handleNestedDynamicListsInComplexTypes()', () => {

    it('should set data for dynamic lists', () => {

      const response = (casesService as any).handleNestedDynamicListsInComplexTypes({
        case_fields: [
          {
            field_type: {
              complex_fields: [
                {
                  field_type: {
                    type: 'DynamicList'
                  },
                  id: 'complex_dl',
                  value: {},
                  formatted_value: {}
                }
              ],
              type: 'Complex'
            },
            value: {
              complex_dl: {
                list_items: [
                  {code: '1', value: '1'},
                  {code: '2', value: '2'}
                ],
                value: {code: '2', value: '2'}
              }
            }
          }
        ]
      });

      const expected = {
        case_fields: [
          {
            field_type: {
              complex_fields: [
                {
                  field_type: {
                    type: 'DynamicList'
                  },
                  id: 'complex_dl',
                  value: {
                    list_items: [
                      {code: '1', value: '1'},
                      {code: '2', value: '2'}
                    ],
                    value: {code: '2', value: '2'}
                  },
                  formatted_value: {
                    list_items: [
                      {code: '1', value: '1'},
                      {code: '2', value: '2'}
                    ],
                    value: {code: '2', value: '2'}
                  }
                }
              ],
              type: 'Complex'
            },
            value: {
              complex_dl: {
                list_items: [
                  {code: '1', value: '1'},
                  {code: '2', value: '2'}
                ],
                value: {code: '2', value: '2'}
              }
            }
          }
        ]
      };

      expect(response).toEqual(expected);
    });
  });
});
