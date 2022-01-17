import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AbstractAppConfig } from '../../../../../../app.config';
import { AlertService, HttpErrorService, HttpService, SessionStorageService } from '../../../../../services';
import { WorkAllocationService } from '../../../services';
import { CaseEventCompletionComponent, COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';
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
  let mockWorkAllocationService: WorkAllocationService;
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
        {provide: COMPONENT_PORTAL_INJECTION_TOKEN, useValue: CaseEventCompletionComponent}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventCompletionTaskReassignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
  });

  it('should assign and complete task on continue event', () => {
    spyOn(mockWorkAllocationService, 'assignAndCompleteTask').and.returnValue({subscribe: () => {}});
    component.onContinue();
    expect(mockSessionStorageService.getItem).toHaveBeenCalledTimes(2);
    expect(mockWorkAllocationService.assignAndCompleteTask).toHaveBeenCalled();
  });
});
