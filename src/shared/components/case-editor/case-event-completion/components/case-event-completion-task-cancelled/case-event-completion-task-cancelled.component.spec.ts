import { DebugElement, EventEmitter } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';
import { CaseEventCompletionTaskCancelledComponent } from './case-event-completion-task-cancelled.component';

describe('TaskCancelledComponent', () => {
  let component: CaseEventCompletionTaskCancelledComponent;
  let mockParentComponent: any;
  let fixture: ComponentFixture<CaseEventCompletionTaskCancelledComponent>;

  mockParentComponent = {
    context: {
      task: {
        assignee: '1234-1234-1234-1234'
      },
      caseId: '1620409659381330'
    },
    eventCanBeCompleted: new EventEmitter<boolean>(true)
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
      ],
      declarations: [CaseEventCompletionTaskCancelledComponent],
      providers: [
        {provide: COMPONENT_PORTAL_INJECTION_TOKEN, useValue: mockParentComponent}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseEventCompletionTaskCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task cancelled', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task cancelled/marked as done');
  });

  it('should emit event can be completed true when clicked on continue button', () => {
    spyOn(mockParentComponent.eventCanBeCompleted, 'emit');
    component.onContinue();
    expect(mockParentComponent.eventCanBeCompleted.emit).toHaveBeenCalledWith(true);
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });
});
