import { Observable } from 'rxjs';
import { CaseHistoryService } from './case-history.service';
import { HttpError } from '../../../domain';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpErrorService, HttpService } from '../../../services';
import { CaseHistory } from '../domain';
import { createCaseHistory } from '../../../fixture';
import { classToPlain } from 'class-transformer';
import createSpyObj = jasmine.createSpyObj;
import { HttpHeaders } from '@angular/common/http';

describe('CaseHistoryService', () => {

  const DATA_URL = 'http://data.ccd.reform';
  const CASE_ID = '1';
  const EVENT_ID = '10';
  const CASE_HISTORY_URL = DATA_URL + `/internal/cases/${CASE_ID}/events/${EVENT_ID}`;
  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let httpErrorService: any;

  let caseHistoryService: CaseHistoryService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getCaseHistoryUrl']);
    appConfig.getCaseHistoryUrl.and.returnValue(CASE_HISTORY_URL);

    httpService = createSpyObj<HttpService>('httpService', ['get']);
    httpErrorService = createSpyObj<HttpErrorService>('errorService', ['setError']);

    caseHistoryService = new CaseHistoryService(httpService, httpErrorService, appConfig);
  });

  describe('get()', () => {
    const CASE_HISTORY: CaseHistory = createCaseHistory();

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(classToPlain(CASE_HISTORY, {excludePrefixes: ['_']})));      
    });

    it('should use HttpService::get with correct url', () => {
      caseHistoryService
        .get(CASE_ID, EVENT_ID)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(CASE_HISTORY_URL, {
        headers: new HttpHeaders()
          .set('experimental', 'true')
          .set('Accept', CaseHistoryService.V2_MEDIATYPE_CASE_EVENT_VIEW)
          .set('Content-Type', 'application/json'),
          observe: 'body'
        });
    });

    it('should retrieve case history from server', () => {
      caseHistoryService
        .get(CASE_ID, EVENT_ID)
        .subscribe(
          caseHistory => expect(caseHistory).toEqual(CASE_HISTORY)
        );
    });

    it('should set error when error is thrown', () => {
      httpService.get.and.returnValue(Observable.throw(ERROR));

      caseHistoryService
        .get(CASE_ID, EVENT_ID)
        .subscribe(() => {
        }, err => {
          expect(err).toEqual(ERROR);
          expect(httpErrorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

  });
});
