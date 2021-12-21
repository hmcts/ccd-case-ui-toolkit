import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { EventStates } from '../models';
import { EventStateMachineService } from '../services/event-state-machine.service';
import { EventStartComponent } from './event-start.component';
import createSpyObj = jasmine.createSpyObj;

describe('EventStartComponent', () => {
  let fixture: ComponentFixture<EventStartComponent>;
  let component: EventStartComponent;
  let de: DebugElement;
  let route: any;
  let snapshot: any;
  let service: EventStateMachineService;

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

  beforeEach(async(() => {
    snapshot = {
      data: {
        tasks: tasks,
      },
    };
    route = {
      snapshot: snapshot,
    };
    createSpyObj<EventStateMachineService>('EventStateMachineService', [
      'initialiseStateMachine',
      'createStates',
      'addTransitions',
      'startStateMachine',
    ]);
    TestBed.configureTestingModule({
      declarations: [EventStartComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: EventStateMachineService, useValue: service },
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

  it('should ngOnInit setup context and state machine', () => {
    component.ngOnInit();
    expect(component.context.tasks).toEqual(tasks);
    expect(component.stateMachine).toBeDefined();
    expect(component.stateMachine.currentState.id).toEqual(EventStates.NO_TASK);
  });
});
