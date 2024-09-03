import { Component, Input, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { EventCompletionStateMachineContext } from '../../../domain';
import { CaseEventCompletionTaskCancelledComponent } from './case-event-completion-task-cancelled.component';

@Component({
  template: '<app-case-event-completion-task-cancelled [context]="context"></app-case-event-completion-task-cancelled>'
})
class WrapperComponent {
  @ViewChild(CaseEventCompletionTaskCancelledComponent, { static: true }) public appComponentRef: CaseEventCompletionTaskCancelledComponent;
  @Input() public context: EventCompletionStateMachineContext;
}

describe('TaskCancelledComponent', () => {
  let component: CaseEventCompletionTaskCancelledComponent;
  let wrapper: WrapperComponent;
  let fixture: ComponentFixture<WrapperComponent>;

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
    const sessionStorageSpy = jasmine.createSpyObj('mockSessionStorageService', ['removeItem'])
    wrapper.context = {caseId: '123456789', sessionStorageService: sessionStorageSpy} as EventCompletionStateMachineContext;
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
    expect(component.context.sessionStorageService.removeItem).toHaveBeenCalledWith('taskToComplete')
    expect(component.notifyEventCompletionCancelled.emit).toHaveBeenCalledWith(true);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
