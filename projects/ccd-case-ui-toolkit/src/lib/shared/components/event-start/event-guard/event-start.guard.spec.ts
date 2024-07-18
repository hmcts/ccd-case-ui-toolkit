import { EventStartGuard } from './event-start.guard';
import { WorkAllocationService } from '../../case-editor';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { SessionStorageService } from '../../../services';
import { TestBed } from '@angular/core/testing';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { of } from 'rxjs';

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

  describe('checkTaskInEventNotRequired', () => {
    const caseId = '1234567890';

    it('should return true if there are no tasks in the payload', () => {
      const mockEmptyPayload: TaskPayload = { task_required_for_event: false, tasks: [] };
      expect(guard.checkTaskInEventNotRequired(mockEmptyPayload, caseId, null)).toBe(true);
    });

    // Add more test cases for checkTaskInEventNotRequired function...

  });

  describe('checkForTasks', () => {
    it('should return true and store task if taskId is provided and task is found in payload', () => {
      const payload: TaskPayload = { task_required_for_event: false, tasks: tasks };
      sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId' }));
      const result$ = guard['checkForTasks'](payload, 'caseId', 'eventId', 'taskId');
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
