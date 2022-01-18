import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../../app.config';
import { Caseworker } from '../../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../../domain/work-allocation/judicial-worker.model';
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

  const caseworker: Caseworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Caseworker',
    email: 'testuser@demoenv.com',
    location: null,
    roleCategory: null
  }

  const judicialworker: Judicialworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Judicial User',
    email: 'testuser@demoenv.com',
    location: null
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
      task: {
        assignee: '1234-1234-1234-1234'
      }
    }
  };

  beforeEach(async(() => {
    mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    mockSessionStorageService.getItem.and.returnValue(`[{"email": "testuser@mail.com", "firstName": "Test", "lastName": "User",
      "idamId": "123-123-123-123", "location": null, "roleCategory": null}]`);
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
    spyOn(mockCaseworkerService, 'getCaseworkers').and.returnValue(of([caseworker]));
    spyOn(mockJudicialworkerService, 'getJudicialworkers').and.returnValue(of([judicialworker]));
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
    expect(mockCaseworkerService.getCaseworkers).toHaveBeenCalled();
  });

  it('should assign and complete task on continue event', () => {
    spyOn(mockWorkAllocationService, 'assignAndCompleteTask').and.returnValue({subscribe: () => {}});
    component.onContinue();
    expect(mockSessionStorageService.getItem).toHaveBeenCalledTimes(1);
    expect(mockWorkAllocationService.assignAndCompleteTask).toHaveBeenCalled();
  });
});
