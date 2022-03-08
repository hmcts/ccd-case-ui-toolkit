import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';
import { HttpErrorService, HttpService } from '../../../services';
import { WorkAllocationService } from '../../case-editor';
import { EventTasksResolverService } from './event-tasks-resolver.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventTaskResolverService', () => {
  let appConfig: any;
  let httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
  let errorService: any;
  let workAllocationService: WorkAllocationService;
  let alertService: any;

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
  workAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      EventTasksResolverService,
      { provide: WorkAllocationService, useValue: workAllocationService }
    ]
  }));

  it('should be created', () => {
    const service: EventTasksResolverService = TestBed.get(EventTasksResolverService);
    expect(service).toBeTruthy();
  });

  it('should resolve to get tasks by case id and event id', (done) => {
    const service: EventTasksResolverService = TestBed.get(EventTasksResolverService);
    spyOn(workAllocationService, 'getTasksByCaseIdAndEventId').and.returnValue(of(taskPayload));
    const activatedRoute = new ActivatedRouteSnapshot();
    activatedRoute.params = {
      caseId: 'case-123',
      eventId: 'event-123'
    };
    service.resolve(activatedRoute).subscribe((value: Task[]) => {
      expect(value).toEqual(taskPayload.tasks);
      done();
    });
    expect(workAllocationService.getTasksByCaseIdAndEventId).toHaveBeenCalled();
  });
});
