import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpError } from '../../../domain';
import { Judicialworker } from '../../../domain/work-allocation/judicial-worker.model';
import { HttpErrorService, HttpService } from '../../../services';
import { JudicialworkerService } from './judicial-worker.service';
import createSpyObj = jasmine.createSpyObj;

describe('JudicialworkerService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  const JUDICIAL_WORKER_URL = `${API_URL}/roles/getJudicialUsers`;
  const JUDICIAL_WORKER_1: Judicialworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Judicial User',
    email: 'testuser@demoenv.com',
    location: null
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
    httpService.post.and.returnValue(of([JUDICIAL_WORKER_1]));
    judicialworkerService.getJudicialworkers(userIds).subscribe();
    expect(httpService.post).toHaveBeenCalledWith(JUDICIAL_WORKER_URL, {userIds});
  });

  it('should set error service error when the call fails', (done) => {
    const userIds = ['1234-1234-1234-1234'];
    httpService.post.and.returnValue(throwError(ERROR));
    judicialworkerService.getJudicialworkers(userIds)
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
