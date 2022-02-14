import { PortalModule } from '@angular/cdk/portal';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, EventEmitter, SimpleChange } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseEventCompletionTaskCancelledComponent, CaseEventCompletionTaskReassignedComponent } from '.';
import { AbstractAppConfig } from '../../../../app.config';
import { Task } from '../../../domain/work-allocation/Task';
import { AlertService, HttpErrorService, HttpService } from '../../../services';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { EventCompletionParams } from '../domain/event-completion-params.model';
import { EventCompletionPortalTypes } from '../domain/event-completion-portal-types.model';
import { CaseworkerService, JudicialworkerService } from '../services';
import { EventCompletionStateMachineService } from '../services/event-completion-state-machine.service';
import { WorkAllocationService } from '../services/work-allocation.service';
import { CaseEventCompletionComponent, COMPONENT_PORTAL_INJECTION_TOKEN } from './case-event-completion.component';
import createSpyObj = jasmine.createSpyObj;

describe('CaseEventCompletionComponent', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let fixture: ComponentFixture<CaseEventCompletionComponent>;
  let component: CaseEventCompletionComponent;
  let de: DebugElement;
  let appConfig: any;
  let httpService: HttpService;
  let errorService: HttpErrorService;
  let alertService: AlertService;
  let mockWorkAllocationService: WorkAllocationService;
  let mockCaseworkerService: CaseworkerService;
  let mockJudicialworkerService: JudicialworkerService;
  let eventCompletionStateMachineService: any;
  let parentComponent: any;
  let mockRouter: Router;
  let mockRoute: ActivatedRoute;

  const task: Task = {
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

  const eventCompletionParams: EventCompletionParams = {
    task: task,
    caseId: '1234-1234-1234-1234',
    eventId: '4321-4321-4321-4321'
  };

  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);
  mockCaseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  mockJudicialworkerService = new JudicialworkerService(httpService, appConfig, errorService);
  eventCompletionStateMachineService = createSpyObj<EventCompletionStateMachineService>('EventCompletionStateMachineService', ['initialiseStateMachine', 'createStates', 'addTransitions', 'startStateMachine']);

  const context = {
    task: task,
    caseId: '1620409659381330',
    eventId: null,
    router: mockRouter,
    route: mockRoute,
    sessionStorageService: null,
    workAllocationService: mockWorkAllocationService,
    alertService: alertService,
    canBeCompleted: false,
    component: this
  };

  parentComponent = {
    context: context,
    eventCanBeCompleted: new EventEmitter<boolean>(true)
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        PortalModule
      ],
      declarations: [
        CaseEventCompletionComponent,
        CaseEventCompletionTaskCancelledComponent,
        CaseEventCompletionTaskReassignedComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        SessionStorageService,
        { provide: WorkAllocationService, useValue: mockWorkAllocationService },
        { provide: AlertService, useValue: alertService },
        { provide: EventCompletionStateMachineService, useValue: eventCompletionStateMachineService },
        {provide: CaseworkerService, useValue: mockCaseworkerService},
        {provide: JudicialworkerService, useValue: mockJudicialworkerService},
        {provide: COMPONENT_PORTAL_INJECTION_TOKEN, useValue: parentComponent}
      ],
    })
    .overrideModule(BrowserDynamicTestingModule,
      {
        set: {
          entryComponents: [
            CaseEventCompletionTaskCancelledComponent,
            CaseEventCompletionTaskReassignedComponent
          ]
        }
      }
    )
    .compileComponents();

    fixture = TestBed.createComponent(CaseEventCompletionComponent);
    component = fixture.componentInstance;
    component.eventCompletionParams = eventCompletionParams;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should create', () => {
    component.eventCompletionParams = eventCompletionParams;
    expect(component).toBeTruthy();
  });

  it('should create context and start state machine', () => {
    eventCompletionStateMachineService.initialiseStateMachine.and.returnValue();
    component.eventCompletionParams = eventCompletionParams;
    component.ngOnChanges({ eventCompletionParams: new SimpleChange(null, eventCompletionParams, false) });
    fixture.detectChanges();
    expect(component.context.caseId).toEqual('1234-1234-1234-1234');
    expect(component.context.eventId).toEqual('4321-4321-4321-4321');
    expect(component.context.task).toEqual(task);
    expect(eventCompletionStateMachineService.initialiseStateMachine).toHaveBeenCalled();
    expect(eventCompletionStateMachineService.createStates).toHaveBeenCalled();
    expect(eventCompletionStateMachineService.addTransitions).toHaveBeenCalled();
    expect(eventCompletionStateMachineService.startStateMachine).toHaveBeenCalled();
  });

  it('should load task cancelled component in cdk portal', () => {
    component.context = context;
    component.showPortal(EventCompletionPortalTypes.TaskCancelled);
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    expect(component.selectedComponentPortal).toBeTruthy();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
