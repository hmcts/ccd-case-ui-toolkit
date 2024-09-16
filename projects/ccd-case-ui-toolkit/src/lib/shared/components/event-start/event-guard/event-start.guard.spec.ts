import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { UserInfo } from '../../../domain/user/user-info.model';
import { SessionStorageService } from '../../../services';
import { WorkAllocationService } from '../../case-editor';
import { EventStartGuard } from './event-start.guard';

describe('EventStartGuard', () => {
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

  let guard: EventStartGuard;
  let service: jasmine.SpyObj<WorkAllocationService>;
  let router: jasmine.SpyObj<Router>;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;

  beforeEach(() => {
    service = jasmine.createSpyObj('WorkAllocationService', ['getTasksByCaseIdAndEventId']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    sessionStorageService = jasmine.createSpyObj('SessionStorageService', ['getItem', 'setItem', 'removeItem']);

    TestBed.configureTestingModule({
      providers: [
        EventStartGuard,
        { provide: WorkAllocationService, useValue: service },
        { provide: Router, useValue: router },
        { provide: SessionStorageService, useValue: sessionStorageService }
      ]
    });

    guard = TestBed.inject(EventStartGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('canActivate should return false if case info is not found in session storage', () => {
    sessionStorageService.getItem.and.returnValue(null);
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(false);
    });
  });

  it('canActivate should navigate to event-start if task is required for event', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId' }));
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const payload: TaskPayload = { task_required_for_event: true } as TaskPayload;
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(false);
      expect(router.navigate).toHaveBeenCalledWith(['/cases/case-details/caseId/event-start'], { queryParams: { caseId: 'caseId', eventId: 'eventId', taskId: undefined } });
    });
  });

  it('canActivate should return true if task is not required for event', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId' }));
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const payload: TaskPayload = { task_required_for_event: false, tasks: tasks } as TaskPayload;
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(true);
    });
  });

  // Add more test cases for canActivate function to cover other scenarios...

  function getExampleUserInfo(): UserInfo {
    return {
      id: '1',
      forename: 'T',
      surname: 'Testing',
      email: 'testing@mail.com',
      active: true,
      roles: [],
      roleCategories: []
    };
  }

  describe('checkTaskInEventNotRequired', () => {
    const caseId = '1234567890';

    it('should return true if there are no tasks in the payload', () => {
      const mockEmptyPayload: TaskPayload = { task_required_for_event: false, tasks: [] };
      expect(guard.checkTaskInEventNotRequired(mockEmptyPayload, caseId, null)).toBe(true);
    });

    it('should return true if there are no tasks assigned to the user', () => {
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null)).toBe(true);
    });

    it('should return true and navigate to event trigger if one task is assigned to user', () => {
      const clientContext = {
        client_context: {
          user_task: {
            task_data: tasks[0],
            complete_task: true
          }
        }
      }
      tasks[0].assignee = '1';
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null)).toBe(true);
      expect(sessionStorageService.setItem).toHaveBeenCalledWith('clientContext', JSON.stringify(clientContext));
    });

    it('should return false with error navigation if there are more than 1 tasks assigned to the user', () => {
      tasks[0].assignee = '1';
      tasks.push(tasks[0]);
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
    });

    it('should return true and navigate to event trigger if navigated to via task next steps', () => {
      const clientContext = {
        client_context: {
          user_task: {
            task_data: tasks[0],
            complete_task: true
          }
        }
      }
      tasks[0].assignee = '1';
      tasks.push(tasks[0]);
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6')).toBe(true);
      expect(sessionStorageService.setItem).toHaveBeenCalledWith('clientContext', JSON.stringify(clientContext));
    });

  });

  describe('checkForTasks', () => {
    it('should return true and store task if taskId is provided and task is found in payload', () => {
      const payload: TaskPayload = { task_required_for_event: false, tasks: tasks };
      sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId' }));
      const result$ = guard['checkForTasks'](payload, 'caseId', 'eventId', 'taskId', 'userId');
      result$.subscribe(result => {
        expect(result).toBe(true);
      });
    });
  });

  function createActivatedRouteSnapshot(cid: string, eid: string): ActivatedRouteSnapshot {
    const route = {} as ActivatedRouteSnapshot;
    route.params = { cid: cid, eid: eid };
    route.queryParams = {};
    return route;
  }
});
