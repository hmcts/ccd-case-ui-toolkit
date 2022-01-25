import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AbstractAppConfig } from '../../../../../app.config';
import { Caseworker } from '../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../domain/work-allocation/judicial-worker.model';
import { Task } from '../../../../domain/work-allocation/Task';
import { HttpErrorService, HttpService } from '../../../../services';
import { CaseworkerService, JudicialworkerService } from '../../../case-editor/services';
import { TaskAssignedComponent } from './task-assigned.component';
import createSpyObj = jasmine.createSpyObj;

describe('TaskRequirementComponent', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  let component: TaskAssignedComponent;
  let fixture: ComponentFixture<TaskAssignedComponent>;
  let appConfig: any;
  let httpService: HttpService;
  let errorService: HttpErrorService;
  let mockCaseworkerService: CaseworkerService;
  let mockJudicialworkerService: JudicialworkerService;
  const task: Task = {
    assignee: '123-123-123-123',
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
    sidam_id: '4321-4321-4321-4321',
    full_name: 'Test Judicialworker',
    email_id: 'testuser@demoenv.com'
  }
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330'
        }
      },
      queryParams: task
    }
  };

  appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl', 'getWorkAllocationApiUrl', 'getCamRoleAssignmentsApiUrl']);
  appConfig.getApiUrl.and.returnValue(API_URL);
  appConfig.getCaseDataUrl.and.returnValue(API_URL);
  appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
  httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
  errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
  mockCaseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  mockJudicialworkerService = new JudicialworkerService(httpService, appConfig, errorService);

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskAssignedComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute},
        {provide: CaseworkerService, useValue: mockCaseworkerService},
        {provide: JudicialworkerService, useValue: mockJudicialworkerService},
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignedComponent);
    component = fixture.componentInstance;
    spyOn(mockCaseworkerService, 'getCaseworkers').and.returnValue(of(null));
    spyOn(mockJudicialworkerService, 'getJudicialworkers').and.returnValue(of([judicialworker]));
    component.task.assignee = '4321-4321-4321-4321';
    fixture.detectChanges();
  });

  it('should display error message task assigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task assignment required');
    expect(mockCaseworkerService.getCaseworkers).toHaveBeenCalled();
    expect(mockJudicialworkerService.getJudicialworkers).toHaveBeenCalled();
    expect(component.assignedUserName).toEqual('Test Judicialworker');
  });

  it('should unsubscribe subscriptions', () => {
    spyOn(component.caseworkerSubscription, 'unsubscribe').and.callThrough();
    spyOn(component.judicialworkerSubscription, 'unsubscribe').and.callThrough();
    component.ngOnDestroy();
    expect(component.caseworkerSubscription.unsubscribe).toHaveBeenCalled();
    expect(component.judicialworkerSubscription.unsubscribe).toHaveBeenCalled();
  });
});
