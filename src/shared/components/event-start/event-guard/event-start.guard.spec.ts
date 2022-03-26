import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { EventStartGuard } from './event-start.guard';
import { of } from 'rxjs';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../app.config';
import { UserInfo } from '../../../domain/user/user-info.model';

describe('EventStartGuard', () => {
  const WORK_ALLOCATION_1_API_URL = 'workallocation';
  const WORK_ALLOCATION_2_API_URL = 'workallocation2';
  const tasks: any[] = [
    {
      assignee: null,
      assigneeName: null,
      id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
      task_title: 'Some lovely task name',
      dueDate: '2021-05-20T16:00:00.000+0000',
      description: '[End the appeal](/cases/case-details/${[CASE_REFERENCE]}/trigger/endAppeal/endAppealendAppeal',
      location_name: 'Newcastle',
      location_id: '366796',
      case_id: '1620409659381330',
      case_category: 'asylum',
      case_name: 'Alan Jonson',
      permissions: [],
    }
  ];
  const route = {} as ActivatedRouteSnapshot;
  route.params = {}
  route.params.cid = '1620409659381330';
  route.params.eid = 'start';
  route.queryParams = {};
  const router = createSpyObj('router', ['navigate']);
  const service = createSpyObj('service', ['getTasksByCaseIdAndEventId']);
  const appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
  const sessionStorageService = createSpyObj('sessionStorageService', ['getItem', 'removeItem', 'setItem']);
  sessionStorageService.getItem.and.returnValue(JSON.stringify({cid: '1620409659381330', caseType: 'caseType', jurisdiction: 'IA'}));
  it('canActivate should return false', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_2_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const payload: TaskPayload = {
      task_required_for_event: true,
      tasks
    }
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(false);
    });
  });

  it('canActivate should return true', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_2_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const payload: TaskPayload = {
      task_required_for_event: false,
      tasks: []
    }
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(true);
    });
  });

  it('canActivate should return true for work allocation 1', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_1_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(true);
    });
  });

  function getExampleUserInfo(): UserInfo {
    return {
      id: '1',
      forename: 'T',
      surname: 'Testing',
      email: 'testing@mail.com',
      active: true,
      roles: [],
      roleCategories: []
    }
  }

  describe('checkTaskInEventNotRequired', () => {

    const caseId = '1234567890';
    const eventId = 'testEvent';

    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);

    it('should return true if there are no tasks in the payload', () => {
      const mockEmptyPayload: TaskPayload = {task_required_for_event: false, tasks: []};
      expect(guard.checkTaskInEventNotRequired(mockEmptyPayload, caseId, eventId)).toBe(true);
    });

    it('should return true if there are no tasks assigned to the user', () => {
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks: tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, eventId)).toBe(true);
    });

    it('should return true and navigate to event trigger if one task is assigned to user', () => {
      tasks[0].assignee = '1';
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks: tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, eventId)).toBe(true);
      expect(sessionStorageService.setItem).toHaveBeenCalledWith('taskToComplete', JSON.stringify(tasks[0]));
      expect(router.navigate).toHaveBeenCalledWith([`/cases/case-details/${caseId}/trigger/${eventId}`]);
    });

    it('should return false with error navigation if there are more than 1 tasks assigned to the user', () => {
      tasks[0].assignee = '1';
      tasks.push(tasks[0]);
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks: tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, eventId)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
    });

  });
});
