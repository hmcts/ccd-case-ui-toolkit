import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { Caseworker } from '../../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../../domain/work-allocation/judicial-worker.model';
import { Task } from '../../../../../domain/work-allocation/Task';
import { AlertService, HttpErrorService, HttpService, SessionStorageService } from '../../../../../services';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { EventCompletionStateMachineContext } from '../../../domain';
import { CaseworkerService, JudicialworkerService, WorkAllocationService } from '../../../services';
import { CaseEventCompletionTaskReassignedComponent } from './case-event-completion-task-reassigned.component';
import createSpyObj = jasmine.createSpyObj;
import { getMockCaseNotifier } from '../../../services/case.notifier.spec';

@Component({
  template: '<app-case-event-completion-task-reassigned [context]="context"></app-case-event-completion-task-reassigned>'
})
class WrapperComponent {
  @ViewChild(CaseEventCompletionTaskReassignedComponent, { static: true }) public appComponentRef: CaseEventCompletionTaskReassignedComponent;
  @Input() public context: EventCompletionStateMachineContext;
}

describe('TaskReassignedComponent', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let component: CaseEventCompletionTaskReassignedComponent;
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  let mockSessionStorageService: any;
  let appConfig: any;
  let httpService: HttpService;
  let errorService: HttpErrorService;
  let alertService: AlertService;
  let mockCaseworkerService: CaseworkerService;
  let mockJudicialworkerService: JudicialworkerService;
  let mockWorkAllocationService: WorkAllocationService;
  let sessionStorageService;

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
  };

  const judicialworker: Judicialworker = {
    title: null,
    knownAs: null,
    sidam_id: '1234-1234-1234-1234',
    full_name: 'Test Judicialworker',
    email_id: 'testuser@demoenv.com'
  };

  const mockRoute: any = {
    snapshot: {
      params: {
        cid: '1620409659381330'
      }
    }
  };

  const CLIENT_CONTEXT = { client_context: {
    user_task: {
      task_data: {
        id: '1',
        name: 'Example task',
        case_id: '1234567890'
      },
      complete_task: true
    }
  }};


  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  alertService = jasmine.createSpyObj('alertService', ['clear', 'warning', 'setPreserveAlerts']);
  sessionStorageService = jasmine.createSpyObj('sessionStorageService', ['getItem']);
  sessionStorageService.getItem.and.returnValue(JSON.stringify({cid: '1620409659381330', caseType: 'caseType', jurisdiction: 'IA', roles: []}));
  mockWorkAllocationService = new WorkAllocationService(httpService, appConfig, errorService, alertService, getMockCaseNotifier(), sessionStorageService);
  mockCaseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  mockJudicialworkerService = new JudicialworkerService(httpService, appConfig, errorService);

  beforeEach(async () => {
    mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem', 'setItem']);
    mockSessionStorageService.getItem.and.returnValue(JSON.stringify(CLIENT_CONTEXT));
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CaseEventCompletionTaskReassignedComponent, MockRpxTranslatePipe, WrapperComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute},
        {provide: AlertService, useValue: alertService},
        {provide: SessionStorageService, useValue: mockSessionStorageService},
        {provide: WorkAllocationService, useValue: mockWorkAllocationService},
        {provide: CaseworkerService, useValue: mockCaseworkerService},
        {provide: JudicialworkerService, useValue: mockJudicialworkerService}
      ]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper = fixture.componentInstance;
    component = fixture.componentInstance.appComponentRef;
    wrapper.context = {caseId: '1620409659381330', reassignedTask: task} as EventCompletionStateMachineContext;
    spyOn(mockCaseworkerService, 'getCaseworkers').and.returnValue(of(null));
    spyOn(mockJudicialworkerService, 'getJudicialworkers').and.returnValue(of([judicialworker]));
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
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
    expect(mockSessionStorageService.setItem).toHaveBeenCalledWith('assignNeeded', 'true - override');
  });

  it('should  task on continue event', () => {
    mockSessionStorageService.getItem.and.returnValue('');
    spyOn(mockWorkAllocationService, 'assignAndCompleteTask').and.returnValue({subscribe: () => {}});
    component.onContinue();
    expect(mockSessionStorageService.getItem).toHaveBeenCalledTimes(1);
    expect(mockSessionStorageService.setItem).not.toHaveBeenCalled();
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
