import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StateMachine } from '@edium/fsm';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { EventStartStates, EventStartStateMachineContext, StateMachineStates } from '../models';
import { EventStartStateMachineService } from './event-start-state-machine.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventStartStateMachineService', () => {
  let service: EventStartStateMachineService;
  let stateMachine: StateMachine;
  let mockSessionStorageService: any;
  let mockRoute: ActivatedRoute;
  let mockRouter: any;

  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const noTask: Task[] = [];

  const oneTask: Task = {
    assignee: null,
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
    task_state: null,
    task_system: null,
    task_title: 'Some lovely task name',
    type: null,
    warning_list: null,
    warnings: true,
    work_type_id: null
  };

  const multipleTasks: Task[] = [
    {
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
      task_state: null,
      task_system: null,
      task_title: 'Some lovely task name',
      type: null,
      warning_list: null,
      warnings: true,
      work_type_id: null
    },
    {
      assignee: '4321-4321-4321-4321',
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
      task_state: null,
      task_system: null,
      task_title: 'Some lovely task name',
      type: null,
      warning_list: null,
      warnings: true,
      work_type_id: null
    }
  ];

  mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'setItem']);
  mockSessionStorageService.getItem.and.returnValue(`{"id": "test-user-id", "forename": "Test", "surname": "User",
    "roles": ["caseworker-role1", "caseworker-role3"], "email": "test@mail.com", "token": null}`);

  let context: EventStartStateMachineContext = {
    tasks: [],
    caseId: '1620409659381330',
    eventId: 'editAppealAfterSubmit',
    taskId: '1122-3344-5566-7788',
    router: mockRouter,
    route: mockRoute,
    sessionStorageService: mockSessionStorageService
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    });
    service = new EventStartStateMachineService();
  });

  it('should initialise state machine', () => {
    stateMachine = service.initialiseStateMachine(context);
    expect(stateMachine).toBeDefined();
  });

  it('should create states', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    expect(service.stateCheckForMatchingTasks.id).toEqual(EventStartStates.CHECK_FOR_MATCHING_TASKS);
    expect(service.stateNoTask.id).toEqual(EventStartStates.NO_TASK);
    expect(service.stateOneOrMoreTasks.id).toEqual(EventStartStates.ONE_OR_MORE_TASKS);
    expect(service.stateTaskUnassigned.id).toEqual(EventStartStates.TASK_UNASSIGNED);
    expect(service.stateTaskAssignedToUser.id).toEqual(EventStartStates.TASK_ASSIGNED_TO_USER);
    expect(service.stateOneTaskAssignedToUser.id).toEqual(EventStartStates.ONE_TASK_ASSIGNED_TO_USER);
    expect(service.stateMultipleTasksAssignedToUser.id).toEqual(EventStartStates.MULTIPLE_TASKS_ASSIGNED_TO_USER);
    expect(service.stateFinal.id).toEqual(StateMachineStates.FINAL);
  });

  it('should add transitions', () => {
    spyOn(service, 'addTransitionsForStateCheckForMatchingTasks');
    spyOn(service, 'addTransitionsForStateNoTask');
    spyOn(service, 'addTransitionsForStateTaskUnassigned');

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();

    expect(service.addTransitionsForStateCheckForMatchingTasks).toHaveBeenCalled();
    expect(service.addTransitionsForStateNoTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskUnassigned).toHaveBeenCalled();
  });

  it('should start state machine with no task', () => {
    spyOn(service, 'entryActionForStateCheckForMatchingTasks');
    // Context with no tasks
    context.tasks = [];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventStartStates.CHECK_FOR_MATCHING_TASKS);
    expect(service.entryActionForStateCheckForMatchingTasks).toHaveBeenCalled();
  });

  it('should allow user to perform event if initiated from task tab', () => {
    // Context with one task, and task id matches with context's task id
    // Context's task assignee should be logged in user id
    context.taskId = '1234-1234-1234-1234';
    oneTask.id = '1234-1234-1234-1234';
    oneTask.assignee = 'test-user-id';
    context.tasks = [oneTask];

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(StateMachineStates.FINAL);
    expect(mockSessionStorageService.setItem).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/trigger/${context.eventId}`],
      { queryParams: { isComplete: true }, relativeTo: mockRoute });
  });

  it('should allow user to perform event if one task assigned to user and initiated from dropdown', () => {
    context.taskId = null;
    // Context's task assignee should be logged in user id
    oneTask.assignee = 'test-user-id';
    context.tasks = [oneTask];

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(StateMachineStates.FINAL);
    expect(mockSessionStorageService.setItem).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/trigger/${context.eventId}`],
      { queryParams: { isComplete: true }, relativeTo: mockRoute });
  });

  it('should navigate to task unassigned error page if one unassigned task', () => {
    oneTask.assignee = null;
    context.tasks = [oneTask];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(StateMachineStates.FINAL);
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/task-unassigned`],
      { queryParams: {}, relativeTo: mockRoute });
  });

  it('should navigate to task unassigned error page if one task assigned to another user', () => {
    oneTask.assignee = 'test-another-user-id';
    context.tasks = [oneTask];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(StateMachineStates.FINAL);
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/task-assigned`],
      { queryParams: context.tasks[0], relativeTo: context.route });
  });

  it('should action no task available', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should add transition for state check for matching tasks', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateCheckForMatchingTasks();
    expect(service.addTransitionsForStateCheckForMatchingTasks).toBeTruthy();
  });

  it ('should add transition for state no task', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateNoTask();
    expect(service.addTransitionsForStateNoTask).toBeTruthy();
  });

  it ('should add transition for state one or more tasks', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateOneOrMoreTasks();
    expect(service.addTransitionsForStateOneOrMoreTasks).toBeTruthy();
  });

  it ('should add transition for state task unassigned', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskUnassigned();
    expect(service.addTransitionsForStateTaskUnassigned).toBeTruthy();
  });

  it ('should add transition for state task assigned to user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskAssignedToUser();
    expect(service.addTransitionsForStateTaskAssignedToUser).toBeTruthy();
  });

  it ('should add transition for state one task assigned to user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateOneTaskAssignedToUser();
    expect(service.addTransitionsForStateOneTaskAssignedToUser).toBeTruthy();
  });

  it ('should add transition for state multiple tasks assigned to user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateMultipleTasksAssignedToUser();
    expect(service.addTransitionsForStateMultipleTasksAssignedToUser).toBeTruthy();
  });
});
