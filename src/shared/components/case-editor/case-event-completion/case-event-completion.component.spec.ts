import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
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
import { EventCompletionPortalTypes } from '../domain/event-completion-portal-types.model';
import { EventCompletionStateMachineService } from '../services/event-completion-state-machine.service';
import { WorkAllocationService } from '../services/work-allocation.service';
import { CaseEventCompletionComponent } from './case-event-completion.component';
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
  let eventCompletionStateMachineService: EventCompletionStateMachineService;

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

  const eventCompletionParams = {
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
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);

  beforeEach(async(() => {
    createSpyObj<EventCompletionStateMachineService>('EventCompletionStateMachineService', [
      'initialiseStateMachine',
      'createStates',
      'addTransitions',
      'startStateMachine',
    ]);
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

  it('should load task cancelled component in cdk portal', () => {
    component.showPortal(EventCompletionPortalTypes.TaskCancelled);
    fixture.detectChanges();
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task cancelled/marked as done');
  });
});
