import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpError } from '../../../domain';
import { Caseworker } from '../../../domain/work-allocation/case-worker.model';
import { HttpErrorService, HttpService } from '../../../services';
import { CaseworkerService } from './case-worker.service';
import createSpyObj = jasmine.createSpyObj;

describe('CaseworkerService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  const CASE_WORKER_URL = `${API_URL}/retrieveCaseWorkersForServices`;
  const CASE_WORKER_1: Caseworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Caseworker',
    email: 'testuser@demoenv.com',
    location: null,
    roleCategory: null
  }

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let errorService: HttpErrorService;
  let caseworkerService: CaseworkerService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
    httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
    caseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  });

  it('should call post with correct parameters', () => {
    const serviceId = 'IA';
    httpService.post.and.returnValue(of([CASE_WORKER_1]));
    caseworkerService.getCaseworkers(serviceId).subscribe();
    expect(httpService.post).toHaveBeenCalledWith(CASE_WORKER_URL, {serviceIds: [serviceId]});
  });

  it('should set error service error when the call fails', (done) => {
    const userIds = ['1234-1234-1234-1234'];
    httpService.post.and.returnValue(throwError(ERROR));
    caseworkerService.getCaseworkers(userIds)
      .subscribe(() => {
        // Should not get here... so if we do, make sure it fails.
        done.fail('Get case workers instead of erroring');
      }, err => {
        expect(err).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        done();
      });
  });
});
