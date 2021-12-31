import { Injectable } from "@angular/core";
import { StateMachine } from "@edium/fsm";
import { StateMachineContext } from "../models";

const EVENT_COMPLETION_STATE_MACHINE = 'EVENT COMPLETION STATE MACHINE';

@Injectable()
export class EventCompletionStateMachineService {

	public initialiseStateMachine(context: StateMachineContext): StateMachine {
		return new StateMachine(EVENT_COMPLETION_STATE_MACHINE, context);
	}

  public startStateMachine(stateMachine: StateMachine): void {
    stateMachine.start();
  }

  public createStates(stateMachine: StateMachine): void {

  }

  public addTransitions(): void {

  }
}