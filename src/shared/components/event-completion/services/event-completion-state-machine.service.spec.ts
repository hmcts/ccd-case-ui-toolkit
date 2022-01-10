import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { StateMachine } from '@edium/fsm';
import { EventCompletionStateMachineContext } from '../models/event-completion-state-machine-context.model';
import { EventCompletionStateMachineService } from './event-completion-state-machine.service';
import createSpyObj = jasmine.createSpyObj;

describe('EventCompletionStateMachineService', () => {
  let service: EventCompletionStateMachineService;
  let stateMachine: StateMachine;
  let mockSessionStorageService: any;
  let mockWorkAllocationService: any;
  let mockRoute: ActivatedRoute;
  let mockRouter: any;

  let context: EventCompletionStateMachineContext = {
    task: null,
    caseId: '1620409659381330',
    eventId: 'editAppealAfterSubmit',
    router: mockRouter,
    route: mockRoute,
    sessionStorageService: mockSessionStorageService,
    workAllocationService: mockWorkAllocationService
  }

  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        {provide: Router, useValue: mockRouter}
      ]
    });
    service = new EventCompletionStateMachineService();
  });

  it('should initialise state machine', () => {
    stateMachine = service.initialiseStateMachine(context);
    expect(stateMachine).toBeDefined();
  });
});
