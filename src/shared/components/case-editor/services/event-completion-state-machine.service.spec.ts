import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StateMachine } from '@edium/fsm';
import { of } from 'rxjs';
import { WorkAllocationService } from '.';
import { AbstractAppConfig } from '../../../../app.config';
import { Task } from '../../../domain/work-allocation/Task';
import { TaskRespone } from '../../../domain/work-allocation/task-response.model';
import { AlertService, HttpErrorService, HttpService, SessionStorageService } from '../../../services';
import {
  EventCompletionStateMachineContext,
  EventCompletionStates
} from '../domain';
import { EventCompletionStateMachineService } from './event-completion-state-machine.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventCompletionStateMachineService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let service: EventCompletionStateMachineService;
  let stateMachine: StateMachine;
  let mockSessionStorageService: SessionStorageService;
  let appConfig: jasmine.SpyObj<AbstractAppConfig>;
  let httpService: HttpService;
  let errorService: HttpErrorService;
  let alertService: AlertService;
  let mockWorkAllocationService: WorkAllocationService;
  let mockRoute: ActivatedRoute;
  let mockRouter: any;
  let eventCompletionComponentEmitter: any = {
    eventCanBeCompleted: new EventEmitter<boolean>(true)
  }

  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const oneTask: Task = {
    assignee: '1234-1234-1234-1234',
    auto_assigned: false,
    case_category: 'asylum',
    case_id: '1620409659381330',
    case_management_category: null,
    case_name: 'Alan Jonson',
    case_type_id: null,
    created_date: '2021-04-19T14:00:00.000+0000',
    due_date: '2021-05-20T16:00:00.000+0000',
    execution_type: null,
    id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
    jurisdiction: 'Immigration and Asylum',
    location: null,
    location_name: null,
    name: 'Task name',
    permissions: null,
    region: null,
    security_classification: null,
    task_state: 'assigned',
    task_system: null,
    task_title: 'Some lovely task name',
    type: null,
    warning_list: null,
    warnings: true,
    work_type_id: null
  };

  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = createSpyObj<AlertService>('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);

  let context: EventCompletionStateMachineContext = {
    task: oneTask,
    caseId: '1620409659381330',
    eventId: 'editAppealAfterSubmit',
    router: mockRouter,
    route: mockRoute,
    sessionStorageService: mockSessionStorageService,
    workAllocationService: mockWorkAllocationService,
    alertService: alertService,
    canBeCompleted: false,
    component: eventCompletionComponentEmitter
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {provide: Router, useValue: mockRouter},
        {provide: WorkAllocationService, useValue: mockWorkAllocationService}
      ]
    });
    service = new EventCompletionStateMachineService();
  });

  it('should initialise state machine', () => {
    stateMachine = service.initialiseStateMachine(context);
    expect(stateMachine).toBeDefined();
  });

  it('should create states', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    expect(service.stateCheckTasksCanBeCompleted.id).toEqual(EventCompletionStates.CheckTasksCanBeCompleted);
    expect(service.stateCompleteEventAndTask.id).toEqual(EventCompletionStates.CompleteEventAndTask);
    expect(service.stateTaskCompletedOrCancelled.id).toEqual(EventCompletionStates.TaskCompetedOrCancelled);
    expect(service.stateTaskAssignedToAnotherUser.id).toEqual(EventCompletionStates.TaskAssignedToAnotherUser);
    expect(service.stateTaskUnassigned.id).toEqual(EventCompletionStates.TaskUnassigned);
    expect(service.stateFinal.id).toEqual(EventCompletionStates.Final);
  });

  it('should add transitions', () => {
    spyOn(service, 'addTransitionsForStateCheckTasksCanBeCompleted');
    spyOn(service, 'addTransitionsForStateCompleteEventAndTask');
    spyOn(service, 'addTransitionsForStateTaskAssignedToAnotherUser');
    spyOn(service, 'addTransitionsForStateTaskUnassigned');

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();

    expect(service.addTransitionsForStateCheckTasksCanBeCompleted).toHaveBeenCalled();
    expect(service.addTransitionsForStateCompleteEventAndTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskAssignedToAnotherUser).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskUnassigned).toHaveBeenCalled();
  });

  it('should perform state task assigned to user', () => {
    const taskResponse: TaskRespone = {
      task: oneTask
    };
    spyOn(context.workAllocationService, 'getTask').and.returnValue(of({taskResponse}));
    oneTask.task_state = 'assigned';
    oneTask.assignee = '1234-1234-1234-1234';
    context.task = oneTask;
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventCompletionStates.CheckTasksCanBeCompleted);
    expect(context.workAllocationService.getTask).toHaveBeenCalled();
  });

  it('should perform state task assigned to another user', () => {
    const task = oneTask;
    const taskResponse: TaskRespone = {
      task: oneTask
    };
    spyOn(context.workAllocationService, 'getTask').and.returnValue(of({taskResponse}));
    task.task_state = 'assigned';
    task.assignee = '4321-4321-4321-4321';
    context.task = task;
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventCompletionStates.CheckTasksCanBeCompleted);
    expect(context.workAllocationService.getTask).toHaveBeenCalled();
  });

  it('should perform state task unassigned', () => {
    const taskToTest = oneTask;
    taskToTest.assignee = null;
    taskToTest.task_state = 'unassigned';
    const taskResponse: TaskRespone = {
      task: taskToTest
    };
    spyOn(context.workAllocationService, 'getTask').and.returnValue(of({taskResponse}));
    context.task = taskToTest;
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventCompletionStates.CheckTasksCanBeCompleted);
    expect(context.workAllocationService.getTask).toHaveBeenCalled();
  });

  it('should perform state task completed or cancelled', () => {
    const taskToTest = oneTask;
    taskToTest.task_state = 'completed';
    const taskResponse: TaskRespone = {
      task: taskToTest
    };
    spyOn(context.workAllocationService, 'getTask').and.returnValue(of({taskResponse}));
    context.task = taskToTest;
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventCompletionStates.CheckTasksCanBeCompleted);
    expect(context.workAllocationService.getTask).toHaveBeenCalled();
  });

  it('should add transition for state check taks can be completed', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateCheckTasksCanBeCompleted();
    expect(service.addTransitionsForStateCheckTasksCanBeCompleted).toBeTruthy();
  });

  it('should add transition for state complete event and task', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateCompleteEventAndTask();
    expect(service.addTransitionsForStateCompleteEventAndTask).toBeTruthy();
  });

  it('should add transition for state task completed or cancelled', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskCompletedOrCancelled();
    expect(service.addTransitionsForStateTaskCompletedOrCancelled).toBeTruthy();
  });

  it('should add transition for state task assigned to another user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskAssignedToAnotherUser();
    expect(service.addTransitionsForStateTaskAssignedToAnotherUser).toBeTruthy();
  });

  it('should add transition for state task unassigned', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskUnassigned();
    expect(service.addTransitionsForStateTaskUnassigned).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
