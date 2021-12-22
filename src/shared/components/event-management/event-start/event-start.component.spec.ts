import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Task } from '../../../domain/work-allocation/Task';
import { EventStates } from '../models';
import { EventStateMachineService } from '../services/event-state-machine.service';
import { EventStartComponent } from './event-start.component';
import createSpyObj = jasmine.createSpyObj;

describe('EventStartComponent', () => {
  let fixture: ComponentFixture<EventStartComponent>;
  let component: EventStartComponent;
  let de: DebugElement;
  let mockRouter: any;
  let mockRoute: any;
  let eventStateMachineService: EventStateMachineService;

  mockRouter = {
    navigate: jasmine.createSpy('navigate'),
    routerState: {}
  };

  const noTasks: Task[] = [];

  const tasks: Task[] = [
    {
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
    }
  ];

  mockRoute = {
    snapshot: {
      data: {
        tasks: noTasks,
        case: {
          case_id: '1620409659381330'
        }
      },
    }
  };

  beforeEach(async(() => {
    createSpyObj<EventStateMachineService>('EventStateMachineService', [
      'initialiseStateMachine',
      'createStates',
      'addTransitions',
      'startStateMachine',
    ]);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [EventStartComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: EventStateMachineService, useValue: eventStateMachineService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EventStartComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should ngOnInit setup context and state machine with no tasks', () => {
    component.ngOnInit();
    expect(component.context.tasks).toEqual(noTasks);
    expect(component.stateMachine).toBeDefined();
    expect(component.stateMachine.currentState.id).toEqual(EventStates.SHOW_WARNING);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });
});
