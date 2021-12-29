import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Task } from '../../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../../services';
import { TaskAssignedComponent } from './task-assigned.component';
import createSpyObj = jasmine.createSpyObj;

describe('TaskRequirementComponent', () => {
  let component: TaskAssignedComponent;
  let fixture: ComponentFixture<TaskAssignedComponent>;
  let mockSessionStorageService: any;
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

  beforeEach(async(() => {
    mockSessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    mockSessionStorageService.getItem.and.returnValue(`[{"email": "testuser@mail.com", "firstName": "Test", "lastName": "User",
      "idamId": "123-123-123-123", "location": null, "roleCategory": null}]`);
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskAssignedComponent],
      providers: [
        {provide:SessionStorageService, useValue: mockSessionStorageService},
        {provide: ActivatedRoute, useValue: mockRoute}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task assigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task assignment required');
    expect(component.assignedUserName).toEqual('Test User');
  });
});
