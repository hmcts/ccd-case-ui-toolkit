import { StateMachine } from '@edium/fsm';
import { EventStates, StateMachineStates } from '../models';
import { EventStateMachineService } from './event-state-machine.service';

describe('EventStateMachineService', () => {
  let service: EventStateMachineService;
  let stateMachine: StateMachine;
  const tasks = [
    {
      assignee: null,
      assigneeName: null,
      id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
      task_title: 'Some lovely task name',
      dueDate: '2021-05-20T16:00:00.000+0000',
      description:
        '[End the appeal](/cases/case-details/${[CASE_REFERENCE]}/trigger/endAppeal/endAppealendAppeal',
      location_name: 'Newcastle',
      location_id: '366796',
      case_id: '1620409659381330',
      case_category: 'asylum',
      case_name: 'Alan Jonson',
      permissions: [],
    },
  ];
  let context = {
    tasks: tasks
  };

  beforeEach(() => {
    service = new EventStateMachineService(context);
    stateMachine = new StateMachine('EVENT STATE MACHINE', context);
    service.createStates(stateMachine);
  });

  it('should initialise state machine', () => {
    expect(stateMachine).toBeDefined();
  });

  it('should create states', () => {
    // expect(stateMachine.createState).toHaveBeenCalledTimes(13);
    expect(service.stateCheckForMatchingTasks.id).toEqual(EventStates.CHECK_FOR_MATCHING_TASKS);
    expect(service.stateNoTask.id).toEqual(EventStates.NO_TASK);
    expect(service.stateOneTask.id).toEqual(EventStates.ONE_TASK);
    expect(service.stateMultipleTask.id).toEqual(EventStates.MULTIPLE_TASKS);
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

  it('should start state machine', () => {
    service.addTransitions();
    service.startStateMachine(stateMachine);
    expect(stateMachine.currentState.id).toEqual(EventStates.NO_TASK);
  });

  it('should entry action', () => {
    // TODO: To be implemented
  });

  it('should exit action', () => {
    // TODO: To be implemented
  });

  it('should decide action', () => {
    // TODO: To be implemented
  });

  it('should add transition for state check for matching tasks', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state no task', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state one task', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state multiple tasks', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state task unassigned', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state task assignment required', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state assign task to self', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state ask manager to assign task', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state show warning', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state show error message', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state cancel', () => {
    // TODO: To be implemented
  });

  it ('should add transition for state final', () => {
    // TODO: To be implemented
  });
});
