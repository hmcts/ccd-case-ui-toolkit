import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StateMachine } from '@edium/fsm';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services';
import { EventStates, StateMachineContext, StateMachineStates } from '../models';
import { EventStateMachineService } from './event-state-machine.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventStateMachineService', () => {
  let service: EventStateMachineService;
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

  mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
  mockSessionStorageService.getItem.and.returnValue(`{"id": "test-user-id", "forename": "Test", "surname": "User",
    "roles": ["caseworker-role1", "caseworker-role3"], "email": "test@mail.com", "token": null}`);

  let context: StateMachineContext = {
    tasks: [],
    caseId: '1620409659381330',
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
    service = new EventStateMachineService();
  });

  it('should initialise state machine', () => {
    stateMachine = service.initialiseStateMachine(context);
    expect(stateMachine).toBeDefined();
  });

  it('should create states', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    expect(service.stateCheckForMatchingTasks.id).toEqual(EventStates.CHECK_FOR_MATCHING_TASKS);
    expect(service.stateNoTask.id).toEqual(EventStates.NO_TASK);
    expect(service.stateOneTask.id).toEqual(EventStates.ONE_TASK);
    expect(service.stateMultipleTasks.id).toEqual(EventStates.MULTIPLE_TASKS);
    expect(service.stateTaskAssignedToUser.id).toEqual(EventStates.TASK_ASSIGNED_TO_USER);
    expect(service.stateTaskUnassigned.id).toEqual(EventStates.TASK_UNASSIGNED);
    expect(service.stateTaskAssignmentRequired.id).toEqual(EventStates.TASK_ASSIGNMENT_REQUIRED);
    expect(service.stateAssignTaskToSelf.id).toEqual(EventStates.ASSIGN_TASK_TO_SELF);
    expect(service.stateAskManagerToAssignTask.id).toEqual(EventStates.ASK_MANAGER_TO_ASSIGN_TASK);
    expect(service.stateShowWarning.id).toEqual(EventStates.SHOW_WARNING);
    expect(service.stateShowErrorMessage.id).toEqual(EventStates.SHOW_ERROR_MESSAGE);
    expect(service.stateCancel.id).toEqual(EventStates.CANCEL);
    expect(service.stateFinal.id).toEqual(StateMachineStates.FINAL);
  });

  it('should add transitions', () => {
    spyOn(service, 'addTransitionsForStateCheckForMatchingTasks');
    spyOn(service, 'addTransitionsForStateNoTask');
    spyOn(service, 'addTransitionsForStateOneTask');
    spyOn(service, 'addTransitionsForStateMultipleTasks');
    spyOn(service, 'addTransitionsForStateTaskUnassigned');
    spyOn(service, 'addTransitionsForStateTaskAssignmentRequired');
    spyOn(service, 'addTransitionsForStateAssignTaskToSelf');
    spyOn(service, 'addTransitionsForStateAskManagerToAssignTask');
    spyOn(service, 'addTransitionsForStateShowWarning');
    spyOn(service, 'addTransitionsForStateShowErrorMessage');
    spyOn(service, 'addTransitionsForStateCancel');
    spyOn(service, 'addTransitionsForStateFinal');

    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();

    expect(service.addTransitionsForStateCheckForMatchingTasks).toHaveBeenCalled();
    expect(service.addTransitionsForStateNoTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateOneTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateMultipleTasks).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskUnassigned).toHaveBeenCalled();
    expect(service.addTransitionsForStateTaskAssignmentRequired).toHaveBeenCalled();
    expect(service.addTransitionsForStateAssignTaskToSelf).toHaveBeenCalled();
    expect(service.addTransitionsForStateAskManagerToAssignTask).toHaveBeenCalled();
    expect(service.addTransitionsForStateShowWarning).toHaveBeenCalled();
    expect(service.addTransitionsForStateShowErrorMessage).toHaveBeenCalled();
    expect(service.addTransitionsForStateCancel).toHaveBeenCalled();
    expect(service.addTransitionsForStateFinal).toHaveBeenCalled();
  });

  it('should start state machine with no task', () => {
    spyOn(service, 'initialEntryState');
    // Context with no tasks
    context.tasks = [];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventStates.CHECK_FOR_MATCHING_TASKS);
    expect(service.initialEntryState).toHaveBeenCalled();
  });

  it('should navigate to task unassigned error page if one unassigned task', () => {
    oneTask.assignee = null;
    context.tasks = [oneTask];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventStates.TASK_UNASSIGNED);
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/task-unassigned`], { relativeTo: mockRoute });
  });

  it('should navigate to task unassigned error page if one task assigned to another user', () => {
    oneTask.assignee = 'test-another-user-id';
    context.tasks = [oneTask];
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventStates.TASK_UNASSIGNED);
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/cases/case-details/${context.caseId}/task-assigned`],
      { queryParams: context.tasks[0], relativeTo: context.route });
  });

  it('should entry action', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitions();
    service.startStateMachine(stateMachine);
    service.entryAction(stateMachine.currentState, context);
    expect(service.entryAction).toBeTruthy();
  });

  it('should exit action', () => {
    service.exitAction(stateMachine.currentState);
    expect(service.exitAction).toBeTruthy();
  });

  it('should decide action', () => {
    service.decideAction(stateMachine.currentState, context);
    expect(service.decideAction).toBeTruthy();
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
    // TODO: To be implemented
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateNoTask();
    expect(service.addTransitionsForStateNoTask).toBeTruthy();
  });

  it ('should add transition for state one task', () => {
    // TODO: To be implemented
    service.addTransitionsForStateMultipleTasks();
    expect(service.addTransitionsForStateMultipleTasks).toBeTruthy();
  });

  it ('should add transition for state multiple tasks', () => {
    // TODO: To be implemented
    service.addTransitionsForStateMultipleTasks();
    expect(service.addTransitionsForStateMultipleTasks).toBeTruthy();
  });

  it ('should add transition for state task assigned to user', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskAssignedToUser();
    expect(service.addTransitionsForStateTaskAssignedToUser).toBeTruthy();
  });

  it ('should add transition for state task unassigned', () => {
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateTaskUnassigned();
    expect(service.addTransitionsForStateTaskUnassigned).toBeTruthy();
  });

  it ('should add transition for state task assignment required', () => {
    // TODO: To be implemented
    service.addTransitionsForStateTaskAssignmentRequired();
    expect(service.addTransitionsForStateTaskAssignmentRequired).toBeTruthy();
  });

  it ('should add transition for state assign task to self', () => {
    // TODO: To be implemented
    service.addTransitionsForStateAssignTaskToSelf();
    expect(service.addTransitionsForStateAssignTaskToSelf).toBeTruthy();
  });

  it ('should add transition for state ask manager to assign task', () => {
    // TODO: To be implemented
    service.addTransitionsForStateAskManagerToAssignTask();
    expect(service.addTransitionsForStateAskManagerToAssignTask).toBeTruthy();
  });

  it ('should add transition for state show warning', () => {
    // TODO: To be implemented
    stateMachine = service.initialiseStateMachine(context);
    service.createStates(stateMachine);
    service.addTransitionsForStateShowWarning();
    expect(service.addTransitionsForStateShowWarning).toBeTruthy();
  });

  it ('should add transition for state show error message', () => {
    // TODO: To be implemented
    service.addTransitionsForStateShowErrorMessage();
    expect(service.addTransitionsForStateShowErrorMessage).toBeTruthy();
  });

  it ('should add transition for state cancel', () => {
    // TODO: To be implemented
    service.addTransitionsForStateCancel();
    expect(service.addTransitionsForStateCancel).toBeTruthy();
  });

  it ('should add transition for state final', () => {
    // TODO: To be implemented
    service.addTransitionsForStateFinal();
    expect(service.addTransitionsForStateFinal).toBeTruthy();
  });
});
