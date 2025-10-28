import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { CaseEditComponent } from '../../../case-edit';
import { EventCompletionStateMachineContext } from '../../../domain';
import { CaseEventCompletionTaskCancelledComponent } from './case-event-completion-task-cancelled.component';
import { Task } from '../../../../../domain/work-allocation/Task';

@Component({
  template: '<app-case-event-completion-task-cancelled [context]="context"></app-case-event-completion-task-cancelled>',
  standalone: false
})
class WrapperComponent {
  @ViewChild(CaseEventCompletionTaskCancelledComponent, { static: true }) public appComponentRef: CaseEventCompletionTaskCancelledComponent;
  @Input() public context: EventCompletionStateMachineContext;
}

describe('TaskCancelledComponent', () => {
  let component: CaseEventCompletionTaskCancelledComponent;
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;
  const taskDetails: Task = {
    assignee: '1234-1234-1234-1234',
    auto_assigned: false,
    case_category: 'asylum',
    case_id: '1620409659381330',
    case_management_category: null,
    case_name: 'Alan Jonson',
    case_type_id: 'Appeal-864',
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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [CaseEventCompletionTaskCancelledComponent, MockRpxTranslatePipe, WrapperComponent],
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WrapperComponent);
    wrapper = fixture.componentInstance;
    component = fixture.componentInstance.appComponentRef;
    const sessionStorageSpy = jasmine.createSpyObj('mockSessionStorageService', ['removeItem']);
    wrapper.context = {caseId: '123456789', task: taskDetails, sessionStorageService: sessionStorageSpy} as EventCompletionStateMachineContext;
    fixture.detectChanges();
  });

  it('should display error message task cancelled', () => {
    const element = fixture.debugElement.nativeElement;
    const heading = element.querySelector('.govuk-heading-m');
    expect(heading.textContent).toBe('Task cancelled/marked as done');
  });

  it('should emit event can be completed true when clicked on continue button', () => {
    spyOn(component.notifyEventCompletionCancelled, 'emit');
    component.onContinue();
    expect(component.context.sessionStorageService.removeItem).toHaveBeenCalledWith(CaseEditComponent.CLIENT_CONTEXT);
    expect(component.notifyEventCompletionCancelled.emit).toHaveBeenCalledWith(true);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
