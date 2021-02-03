import { Response, ResponseOptions } from '@angular/http';
import { Observable, throwError } from 'rxjs';

import { AbstractAppConfig } from '../../../../app.config';
import { HttpError, TaskSearchParameters } from '../../../domain';
import { HttpErrorService, HttpService } from '../../../services';
import { MULTIPLE_TASKS_FOUND, WorkAllocationService } from './work-allocation.service';

import createSpyObj = jasmine.createSpyObj;

describe('WorkAllocationService', () => {

  const API_URL = 'http://aggregated.ccd.reform';
  const MOCK_TASK_1 = { id: 'Task_1', caseReference: '1234567890' };
  const MOCK_TASK_2 = { id: 'Task_2', caseReference: '2345678901' };
  const TASK_SEARCH_URL = `${API_URL}/task`;
  const TASK_COMPLETE_URL = `${API_URL}/task/${MOCK_TASK_1.id}/complete`;

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  const COMPLETE_ERROR: HttpError = new HttpError();
  ERROR.message = 'Complete task error!';

  let appConfig: any;
  let httpService: any;
  let errorService: any;
  let workAllocationService: WorkAllocationService;
  let alertService: any;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);

    httpService = createSpyObj<HttpService>('httpService', ['post']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
    alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
    workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);
  });

  describe('searchTasks', () => {

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({ tasks: [ MOCK_TASK_1 ] })
      }))));
    });

    it('should call post with the correct parameters', () => {
      const searchRequest: TaskSearchParameters = {
        parameters: [ { ccdId: '1234567890' } ]
      };
      workAllocationService.searchTasks(searchRequest).subscribe();

      expect(httpService.post).toHaveBeenCalledWith(TASK_SEARCH_URL, { searchRequest });
    });

    it('should retrieve a list of matching tasks', (done) => {
      const searchRequest: TaskSearchParameters = {
        parameters: [ { ccdId: '1234567890' } ]
      };
      workAllocationService.searchTasks(searchRequest)
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
      const searchRequest: TaskSearchParameters = {
        parameters: [ { ccdId: '1234567890' } ]
      };
      workAllocationService.searchTasks(searchRequest)
        .subscribe(() => {
          // Should not get here... so if we do, make sure it fails.
          done.fail('Got back tasks instead of erroring');
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
          done();
        });
    });

  });

  describe('completeTask', () => {

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({})
      }))));
    });

    it('should call post with the correct parameters', () => {
      workAllocationService.completeTask(MOCK_TASK_1.id).subscribe();
      expect(httpService.post).toHaveBeenCalledWith(TASK_COMPLETE_URL, {});
    });

    it('should set error service error when the call fails', (done) => {
      httpService.post.and.returnValue(throwError(ERROR));
      workAllocationService.completeTask(MOCK_TASK_1.id)
        .subscribe(() => {
          // Should not get here... so if we do, make sure it fails.
          done.fail('Completed task instead of erroring');
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
          // no longer expecting previous values to have been called
          // expect(alertService.clear).toHaveBeenCalled();
          expect(alertService.setPreserveAlerts).toHaveBeenCalled();
          expect(alertService.warning).toHaveBeenCalled();
          done();
        });
    });

  });

  describe('completeAppropriateTask', () => {

    it('should succeed when no tasks are found', (done) => {
      const completeSpy = spyOn(workAllocationService, 'completeTask');
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({ tasks: [] })
      }))));
      workAllocationService.completeAppropriateTask('1234567890', 'event').subscribe(result => {
        expect(result).toBeTruthy();
        expect(completeSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should attempt to complete the task when one is found', (done) => {
      const COMPLETE_TASK_RESULT = 'Bob';
      const completeSpy = spyOn(workAllocationService, 'completeTask').and.returnValue(Observable.of(COMPLETE_TASK_RESULT));
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({ tasks: [ MOCK_TASK_2 ] })
      }))));
      workAllocationService.completeAppropriateTask('1234567890', 'event').subscribe(result => {
        expect(completeSpy).toHaveBeenCalledWith(MOCK_TASK_2.id);
        done();
      });
    });

    it('should throw an error when more than one task is found', (done) => {
      const completeSpy = spyOn(workAllocationService, 'completeTask');
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({ tasks: [ MOCK_TASK_1, MOCK_TASK_2 ] })
      }))));
      workAllocationService.completeAppropriateTask('1234567890', 'event').subscribe(() => {
        // Should not get here... so if we do, make sure it fails.
        done.fail('Processed multiple tasks instead of erroring');
      }, error => {
        expect(error.message).toEqual(MULTIPLE_TASKS_FOUND);
        expect(completeSpy).not.toHaveBeenCalled();
        done();
      });
    });

    it('should throw an error when failing to complete one task', (done) => {
      const completeSpy = spyOn(workAllocationService, 'completeTask').and.throwError(COMPLETE_ERROR.message);
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify({ tasks: [ MOCK_TASK_2 ] })
      }))));
      workAllocationService.completeAppropriateTask('1234567890', 'event').subscribe(result => {
        // Should not get here... so if we do, make sure it fails.
        done.fail('Completed task instead of erroring');
      }, error => {
        expect(completeSpy).toHaveBeenCalledWith(MOCK_TASK_2.id);
        expect(error.message).toEqual(COMPLETE_ERROR.message); // The error for completing the task.
        done();
      });
    });

  });
});
