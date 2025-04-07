import { TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { HttpErrorService, HttpService } from '../../../services';
import { CaseNotifier, WorkAllocationService } from '../../case-editor';
import { EventTasksResolverService } from './event-tasks-resolver.service';
import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../app.config';
import { getMockCaseNotifier } from '../../case-editor/services/case.notifier.spec';
import { CaseView } from '../../../domain';

describe('EventTaskResolverService', () => {
  // tslint:disable-next-line: prefer-const
  let appConfig: any;
  let httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  let errorService: any;
  let workAllocationService: WorkAllocationService;
  let alertService: any;
  let mockAbstractConfig: any;
  let mockCaseNotifier: CaseNotifier;

  const taskPayload: TaskPayload = {
    task_required_for_event: true,
    tasks: [
      {
        assignee: 'db17f6f7-1abf-4223-8b5e-1eece04ee5d8',
        auto_assigned: false,
        case_category: 'asylum',
        case_id: '1547652071308205',
        case_management_category: null,
        case_name: 'Alan Jonson',
        case_type_id: null,
        created_date: '2021-04-19T14:00:00.000+0000',
        due_date: '2021-05-20T16:00:00.000+0000',
        execution_type: null,
        id: '09470b68-3bd0-11ec-9740-b6b84d919277',
        jurisdiction: 'Immigration and Asylum',
        location: null,
        location_name: null,
        name: 'Task name',
        permissions: null,
        region: null,
        security_classification: null,
        task_state: 'cancelled',
        task_system: null,
        task_title: 'Some lovely task name',
        type: null,
        warning_list: null,
        warnings: true,
        work_type_id: null
      }
    ]};

  httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockCaseNotifier = getMockCaseNotifier();
  workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService, mockCaseNotifier);
  mockAbstractConfig = createSpyObj('abstractConfig', ['logMessage']);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EventTasksResolverService,
      { provide: WorkAllocationService, useValue: workAllocationService },
      { provide: AbstractAppConfig, useValue: mockAbstractConfig },
      { provide: CaseNotifier, useValue: mockCaseNotifier }
    ]
  }));

  it('should be created', () => {
    const service: EventTasksResolverService = TestBed.inject(EventTasksResolverService);
    expect(service).toBeTruthy();
  });

  it('should resolve to get tasks by case id and event id', waitForAsync(() => {
    const service: EventTasksResolverService = TestBed.inject(EventTasksResolverService);
    spyOn(workAllocationService, 'getTasksByCaseIdAndEventId').and.returnValue(of(taskPayload));
    const activatedRoute = new ActivatedRouteSnapshot();
    activatedRoute.params = {
      caseId: 'case-123',
      eventId: 'event-123'
    };
    service.resolve(activatedRoute)
      .subscribe((value: Task[]) => {
        expect(value).toEqual(taskPayload.tasks);
        expect(workAllocationService.getTasksByCaseIdAndEventId).toHaveBeenCalled();
      });
  }));
});

describe('EventTaskResolverService - error', () => {
  // tslint:disable-next-line: prefer-const
  let appConfig: any;
  let httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  let errorService: any;
  let workAllocationService: WorkAllocationService;
  let alertService: any;
  let mockAbstractConfig: any;
  let mockCaseNotifier: CaseNotifier;

  const taskPayload: TaskPayload = {
    task_required_for_event: true,
    tasks: [
      {
        assignee: 'db17f6f7-1abf-4223-8b5e-1eece04ee5d8',
        auto_assigned: false,
        case_category: 'asylum',
        case_id: '1547652071308205',
        case_management_category: null,
        case_name: 'Alan Jonson',
        case_type_id: null,
        created_date: '2021-04-19T14:00:00.000+0000',
        due_date: '2021-05-20T16:00:00.000+0000',
        execution_type: null,
        id: '09470b68-3bd0-11ec-9740-b6b84d919277',
        jurisdiction: 'Immigration and Asylum',
        location: null,
        location_name: null,
        name: 'Task name',
        permissions: null,
        region: null,
        security_classification: null,
        task_state: 'cancelled',
        task_system: null,
        task_title: 'Some lovely task name',
        type: null,
        warning_list: null,
        warnings: true,
        work_type_id: null
      }
    ]};

  httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockCaseNotifier = getMockCaseNotifier({
    case_id: undefined,
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
  workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService, mockCaseNotifier);
  mockAbstractConfig = createSpyObj('abstractConfig', ['logMessage']);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EventTasksResolverService,
      { provide: WorkAllocationService, useValue: workAllocationService },
      { provide: AbstractAppConfig, useValue: mockAbstractConfig },
      { provide: CaseNotifier, useValue: mockCaseNotifier }
    ]
  }));
  it('should log a message and not call getTasksByCaseIdAndEventId when caseInfo is not available', waitForAsync(() => {;
    const service = TestBed.inject(EventTasksResolverService);
    const route = {
      queryParamMap: {
        get: (key: string) => {
          const params = { eventId: 'event123', caseId: 'case123' };
          return params[key];
        }
      }
    } as ActivatedRouteSnapshot;
    spyOn(workAllocationService, 'getTasksByCaseIdAndEventId').and.returnValue(of(taskPayload));
    service.resolve(route);
    expect(mockAbstractConfig.logMessage).toHaveBeenCalledWith('EventTasksResolverService: caseInfo details not available in session storage for case123');
    expect(workAllocationService.getTasksByCaseIdAndEventId).not.toHaveBeenCalled();
  }));
});
