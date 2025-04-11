import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { of } from 'rxjs';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { UserInfo } from '../../../domain/user/user-info.model';
import { ReadCookieService, SessionStorageService } from '../../../services';
import { CaseEditComponent, CaseNotifier, WorkAllocationService } from '../../case-editor';
import { EventStartGuard } from './event-start.guard';
import { AbstractAppConfig } from '../../../../app.config';
import { getMockCaseNotifier } from '../../case-editor/services/case.notifier.spec';
import { CaseView } from '../../../domain/case-view';

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
  let mockCookieService: jasmine.SpyObj<ReadCookieService>;
  let mockAbstractConfig: jasmine.SpyObj<AbstractAppConfig>;
  let mockCaseNotifier: any;

  beforeEach(() => {
    service = jasmine.createSpyObj('WorkAllocationService', ['getTasksByCaseIdAndEventId']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    sessionStorageService = jasmine.createSpyObj('SessionStorageService', ['getItem', 'setItem', 'removeItem']);
    mockCookieService = jasmine.createSpyObj('readCookieService', ['getCookie']);
    mockAbstractConfig = jasmine.createSpyObj('AbstractAppConfig', ['logMessage']);
    mockCaseNotifier = getMockCaseNotifier();
    TestBed.configureTestingModule({
      providers: [
        EventStartGuard,
        { provide: WorkAllocationService, useValue: service },
        { provide: Router, useValue: router },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: AbstractAppConfig, useValue: mockAbstractConfig },
        { provide: ReadCookieService, useValue: mockCookieService },
        { provide: CaseNotifier, useValue: mockCaseNotifier }
      ]
    });

    guard = TestBed.inject(EventStartGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('canActivate should return false if case info is not found in session storage', () => {
    const route = createActivatedRouteSnapshot('1620409659381331', 'eventId');
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(false);
    });
  });

  it('should log a message and not call getTasksByCaseIdAndEventId when caseId not matched with caseInfo caseId', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId123' }));
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const payload: TaskPayload = { task_required_for_event: true } as TaskPayload;
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const result$ = guard.canActivate(route);
    expect(service.getTasksByCaseIdAndEventId).not.toHaveBeenCalled();
    expect(mockAbstractConfig.logMessage).toHaveBeenCalledWith('EventStartGuard: caseId 1620409659381330 in case notifier not matched with the route parameter caseId caseId');
  });

  it('client context should be set with language regardless whether task is attached to event', () => {
    const mockClientContext = { client_context: { user_language: { language: 'cookieString' } } };
    mockCookieService.getCookie.and.returnValue('cookieString');
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(false);
      // check client context is set correctly
      expect(sessionStorageService.setItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(mockClientContext));
    });
  });

  it('client context should be set with language regardless if client context already exists', () => {
    const mockClientContext: any = { client_context: { user_task: {}, additional_field: 'test' } };
    sessionStorageService.getItem.and.returnValues(null, JSON.stringify(mockClientContext));
    mockCookieService.getCookie.and.returnValue('cookieString');
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const result$ = guard.canActivate(route);
    mockClientContext.client_context.user_language = { language: 'cookieString' };
    result$.subscribe(result => {
      expect(result).toEqual(false);
      // check client context is set correctly
      expect(sessionStorageService.setItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(mockClientContext));
    });
  });

  it('canActivate should navigate to event-start if task is required for event', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: 'caseId' }));
    const route = createActivatedRouteSnapshot('1620409659381330', 'eventId');
    const payload: TaskPayload = { task_required_for_event: true } as TaskPayload;
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const result$ = guard.canActivate(route);
    result$.subscribe(result => {
      expect(result).toEqual(false);
      expect(router.navigate).toHaveBeenCalledWith(['/cases/case-details/1620409659381330/event-start'], { queryParams: { caseId: '1620409659381330', eventId: 'eventId', taskId: undefined } });
    });
  });

  it('canActivate should return true if task is not required for event', () => {
    sessionStorageService.getItem.and.returnValue(JSON.stringify({ cid: '1620409659381330' }));
    const route = createActivatedRouteSnapshot('1620409659381330', 'eventId');
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
    const eventId = 'eventId';
    const userId = 'testUser';

    it('should return true if there are no tasks in the payload', () => {
      const mockEmptyPayload: TaskPayload = { task_required_for_event: false, tasks: [] };
      expect(guard.checkTaskInEventNotRequired(mockEmptyPayload, caseId, null, null, null)).toBe(true);
    });

    it('should return true if there are no tasks assigned to the user', () => {
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null, null, null)).toBe(true);
    });

    it('should return true and navigate to event trigger if one task is assigned to user', () => {
      const mockLanguage = 'en';
      const clientContext = {
        client_context: {
          user_task: {
            task_data: tasks[0],
            complete_task: true
          },
          user_language: {
            language: mockLanguage
          }
        }
      }
      tasks[0].assignee = '1';
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      mockCookieService.getCookie.and.returnValue(mockLanguage);
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null, null, null)).toBe(true);
      expect(sessionStorageService.setItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(clientContext));
    });

    it('should return false with error navigation if there are more than 1 tasks assigned to the user', () => {
      tasks[0].assignee = '1';
      tasks.push(tasks[0]);
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, null, null, null)).toBe(false);
      expect(router.navigate).toHaveBeenCalledWith([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
    });

    it('should return true and navigate to event trigger if navigated to via task next steps', () => {
      let baseTime = new Date(2025, 3, 2);
      const mockLanguage = 'cy';
      const clientContext = {
        client_context: {
          user_task: {
            task_data: tasks[0],
            complete_task: true
          },
          user_language: {
            language: mockLanguage
          }
        }
      }
      const mockTaskEventCompletionInfo = {
        caseId,
        eventId,
        userId,
        taskId: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
        createdTimestamp: baseTime.getTime()
      }
      tasks[0].assignee = '1';
      tasks.push(tasks[0]);
      const mockPayload: TaskPayload = {task_required_for_event: false, tasks};
      sessionStorageService.getItem.and.returnValue(JSON.stringify(getExampleUserInfo()));
      mockCookieService.getCookie.and.returnValue(mockLanguage);
      // mock the time so we get the correct timestamp
      jasmine.clock().mockDate(baseTime);
      expect(guard.checkTaskInEventNotRequired(mockPayload, caseId, '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6', eventId, userId)).toBe(true);
      expect(sessionStorageService.setItem).toHaveBeenCalledWith(CaseEditComponent.TASK_EVENT_COMPLETION_INFO, JSON.stringify(mockTaskEventCompletionInfo));
      expect(sessionStorageService.setItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT, JSON.stringify(clientContext));
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

describe('EventStartGuard - error', () => {
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
  let mockCookieService: jasmine.SpyObj<ReadCookieService>;
  let mockAbstractConfig: jasmine.SpyObj<AbstractAppConfig>;
  let mockCaseNotifier: any;

  beforeEach(() => {
    service = jasmine.createSpyObj('WorkAllocationService', ['getTasksByCaseIdAndEventId']);
    router = jasmine.createSpyObj('Router', ['navigate']);
    sessionStorageService = jasmine.createSpyObj('SessionStorageService', ['getItem', 'setItem', 'removeItem']);
    mockCookieService = jasmine.createSpyObj('readCookieService', ['getCookie']);
    mockAbstractConfig = jasmine.createSpyObj('AbstractAppConfig', ['logMessage']);
    mockCaseNotifier = getMockCaseNotifier({
      case_id: '1620409659381330',
      case_type: {
        id: undefined,
        name: '',
        jurisdiction: {
          id: undefined,
          name: '',
          description: ''
        }
      }
    } as CaseView);
    TestBed.configureTestingModule({
      providers: [
        EventStartGuard,
        { provide: WorkAllocationService, useValue: service },
        { provide: Router, useValue: router },
        { provide: SessionStorageService, useValue: sessionStorageService },
        { provide: AbstractAppConfig, useValue: mockAbstractConfig },
        { provide: ReadCookieService, useValue: mockCookieService },
        { provide: CaseNotifier, useValue: mockCaseNotifier }
      ]
    });

    guard = TestBed.inject(EventStartGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should log a message and not call getTasksByCaseIdAndEventId when caseInfo is not available', () => {
    sessionStorageService.getItem.and.returnValue(null);
    const route = createActivatedRouteSnapshot('caseId', 'eventId');
    const payload: TaskPayload = { task_required_for_event: true } as TaskPayload;
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const result$ = guard.canActivate(route);
    expect(service.getTasksByCaseIdAndEventId).not.toHaveBeenCalled();
    expect(mockAbstractConfig.logMessage).toHaveBeenCalledWith(`EventStartGuard: caseInfo details not available in case notifier for caseId`);
  });

  function createActivatedRouteSnapshot(cid: string, eid: string): ActivatedRouteSnapshot {
    const route = {} as ActivatedRouteSnapshot;
    route.params = { cid: cid, eid: eid };
    route.queryParams = {};
    return route;
  }
});
