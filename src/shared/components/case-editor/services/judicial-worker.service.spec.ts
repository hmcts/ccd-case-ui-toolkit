import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpError } from '../../../domain';
import { Judicialworker } from '../../../domain/work-allocation/judicial-worker.model';
import { HttpErrorService, HttpService } from '../../../services';
import { JudicialworkerService } from './judicial-worker.service';
import createSpyObj = jasmine.createSpyObj;

describe('JudicialworkerService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  const JUDICIAL_WORKER_URL = `${API_URL}/getJudicialUsers`;
  const JUDICIAL_WORKER_1: Judicialworker = {
    title: null,
    knownAs: null,
    sidam_id: '4321-4321-4321-4321',
    full_name: 'Test Judicial user',
    email_id: 'testuser@demoenv.com'
  }

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let errorService: HttpErrorService;
  let judicialworkerService: JudicialworkerService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl', 'getUserInfoApiUrl']);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
    httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
    judicialworkerService = new JudicialworkerService(httpService, appConfig, errorService);
  });

  it('should call post with correct parameters', () => {
    const userIds = ['1234-1234-1234-1234'];
    const serviceId = 'IA';
    httpService.post.and.returnValue(of([JUDICIAL_WORKER_1]));
    judicialworkerService.getJudicialworkers(userIds, serviceId).subscribe();
    expect(httpService.post).toHaveBeenCalledWith(JUDICIAL_WORKER_URL, {userIds, services: [serviceId]});
  });

  it('should set error service error when the call fails', (done) => {
    const userIds = ['1234-1234-1234-1234'];
    const serviceId = 'IA';
    httpService.post.and.returnValue(throwError(ERROR));
    judicialworkerService.getJudicialworkers(userIds, serviceId)
      .subscribe(() => {
        // Should not get here... so if we do, make sure it fails.
        done.fail('Get judicial workers instead of erroring');
      }, err => {
        expect(err).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        done();
      });
  });
});
