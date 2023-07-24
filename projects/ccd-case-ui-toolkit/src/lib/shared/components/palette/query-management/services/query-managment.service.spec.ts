import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../../app.config';
import { HttpError, TaskSearchParameter } from '../../../../domain';
import { AlertService, HttpErrorService, HttpService } from '../../../../services';
import { QueryManagmentService } from './query-managment.service';

describe('QueryManagmentService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let service: QueryManagmentService;
  let appConfig: any;
  let alertService: any;
  let httpService: any;
  let errorService: any;

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  const COMPLETE_ERROR: HttpError = new HttpError();
  ERROR.message = 'Complete task error!';
  const MOCK_TASK_1 = { id: 'Task_1', caseReference: '1234567890' };

  beforeEach(() => {
    alertService = jasmine.createSpyObj('alertService', ['warning']);
    appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
    httpService = jasmine.createSpyObj<HttpService>('httpService', ['post', 'get']);
    httpService.post.and.returnValue(of(200));
    errorService = jasmine.createSpyObj<HttpErrorService>('errorService', ['setError']);
    alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AbstractAppConfig, useValue: appConfig},
        { provide: HttpService, useValue: httpService},
        { provide: HttpErrorService, useValue: errorService},
        { provide: AlertService, useValue: alertService }
      ]
    });
    service = TestBed.inject(QueryManagmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call post with the correct parameters', () => {
    service.completeTask(MOCK_TASK_1.id).subscribe();
    expect(httpService.post).toHaveBeenCalledWith(`${API_URL}/task/${MOCK_TASK_1.id}/complete`, {});
  });

  it('should set error service error when the search fails', (done) => {
    httpService.post.and.returnValue(throwError(ERROR));
    const searchRequest: TaskSearchParameter = { ccdId: '1234567890' };
    service.searchTasks(searchRequest)
      .subscribe(() => {
        done.fail('Got back tasks instead of erroring');
      }, err => {
        expect(err).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        done();
      });
  });

  it('should call post with the correct parameters', () => {
    const searchRequest: TaskSearchParameter = { ccdId: '1234567890' };
    service.searchTasks(searchRequest).subscribe();

    expect(httpService.post).toHaveBeenCalledWith(`${API_URL}/searchForCompletable`, { searchRequest }, null, false);
  });

  it('should retrieve a list of matching tasks', (done) => {
    const searchRequest: TaskSearchParameter = { ccdId: '1234567890' };
    httpService.post.and.returnValue(of({ tasks: [ MOCK_TASK_1 ]}));
    service.searchTasks(searchRequest)
      .subscribe((response: any) => {
        expect(response).toBeDefined();
        expect(response.tasks).toBeDefined();
        expect(Array.isArray(response.tasks)).toBeTruthy();
        const tasks: any[] = response.tasks;
        expect(tasks.length).toEqual(1);
        expect(tasks).toContain(MOCK_TASK_1);
        done();
      });
  });

  it('should set error service error when the search fails', (done) => {
    httpService.post.and.returnValue(throwError(ERROR));
    const searchRequest: TaskSearchParameter = { ccdId: '1234567890' };
    service.searchTasks(searchRequest)
      .subscribe(() => {
        done.fail('Got back tasks instead of erroring');
      }, err => {
        expect(err).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        done();
      });
  });
});
