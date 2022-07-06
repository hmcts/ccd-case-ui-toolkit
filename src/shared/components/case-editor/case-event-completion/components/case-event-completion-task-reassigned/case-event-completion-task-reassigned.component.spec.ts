import { DebugElement, EventEmitter } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { Caseworker } from '../../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../../domain/work-allocation/judicial-worker.model';
import { Task } from '../../../../../domain/work-allocation/Task';
import { AlertService, HttpErrorService, HttpService, SessionStorageService } from '../../../../../services';
import { CaseworkerService, JudicialworkerService, WorkAllocationService } from '../../../services';
import { COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';
import { CaseEventCompletionTaskReassignedComponent } from './case-event-completion-task-reassigned.component';
import createSpyObj = jasmine.createSpyObj;

describe('TaskReassignedComponent', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let component: CaseEventCompletionTaskReassignedComponent;
  let fixture: ComponentFixture<CaseEventCompletionTaskReassignedComponent>;
  let mockSessionStorageService: any;
  let appConfig: any;
  let httpService: HttpService;
  let errorService: HttpErrorService;
  let alertService: AlertService;
  let mockCaseworkerService: CaseworkerService;
  let mockJudicialworkerService: JudicialworkerService;
  let mockWorkAllocationService: WorkAllocationService;
  let parentComponent: any;

  const task: Task = {
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
  };

  const caseworker: Caseworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Caseworker',
    email: 'testuser@demoenv.com',
    location: null,
    roleCategory: null
  }

  const judicialworker: Judicialworker = {
    title: null,
    knownAs: null,
    sidam_id: '1234-1234-1234-1234',
    full_name: 'Test Judicialworker',
    email_id: 'testuser@demoenv.com'
  }

  const mockRoute: any = {
    snapshot: {
      params: {
        'cid': '1620409659381330'
      }
    }
  };

  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService);
  mockCaseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  mockJudicialworkerService = new JudicialworkerService(httpService, appConfig, errorService);

  parentComponent = {
    context: {
      reassignedTask: {
        assignee: '1234-1234-1234-1234'
      }
    },
    eventCanBeCompleted: new EventEmitter<boolean>(true)
  };

  beforeEach(async(() => {
    mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    mockSessionStorageService.getItem.and.returnValue(JSON.stringify(task));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CaseEventCompletionTaskReassignedComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute},
        {provide: AlertService, useValue: alertService},
        {provide: SessionStorageService, useValue: mockSessionStorageService},
        {provide: WorkAllocationService, useValue: mockWorkAllocationService},
        {provide: CaseworkerService, useValue: mockCaseworkerService},
        {provide: JudicialworkerService, useValue: mockJudicialworkerService},
        {provide: COMPONENT_PORTAL_INJECTION_TOKEN, useValue: parentComponent}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventCompletionTaskReassignedComponent);
    component = fixture.componentInstance;
    spyOn(mockCaseworkerService, 'getCaseworkers').and.returnValue(of(null));
    spyOn(mockJudicialworkerService, 'getJudicialworkers').and.returnValue(of([judicialworker]));
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
    expect(mockCaseworkerService.getCaseworkers).toHaveBeenCalled();
    expect(mockJudicialworkerService.getJudicialworkers).toHaveBeenCalled();
    expect(component.assignedUserName).toEqual('Test Judicialworker');
  });

  it('should assign and complete task on continue event', () => {
    spyOn(mockWorkAllocationService, 'assignAndCompleteTask').and.returnValue({subscribe: () => {}});
    component.onContinue();
    expect(mockSessionStorageService.getItem).toHaveBeenCalledTimes(1);
    expect(mockWorkAllocationService.assignAndCompleteTask).toHaveBeenCalled();
  });

  it('should unsubscribe subscriptions', () => {
    spyOn(component.caseworkerSubscription, 'unsubscribe').and.callThrough();
    spyOn(component.judicialworkerSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.caseworkerSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.judicialworkerSubscription.unsubscribe).toHaveBeenCalled();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
