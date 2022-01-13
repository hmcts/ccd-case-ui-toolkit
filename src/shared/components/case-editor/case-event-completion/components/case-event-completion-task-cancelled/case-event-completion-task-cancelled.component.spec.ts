import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseEventCompletionTaskCancelledComponent } from './case-event-completion-task-cancelled.component';

describe('TaskCancelledComponent', () => {
  let component: CaseEventCompletionTaskCancelledComponent;
  let fixture: ComponentFixture<CaseEventCompletionTaskCancelledComponent>;
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330'
        }
      },
      params: {
        'cid': '1620409659381330'
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [CaseEventCompletionTaskCancelledComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute}
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
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task cancelled/marked as done');
  });
});
