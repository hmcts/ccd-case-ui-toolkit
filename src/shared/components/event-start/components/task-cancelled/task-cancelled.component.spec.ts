import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TaskCancelledComponent } from './task-cancelled.component';

describe('TaskCancelledComponent', () => {
  let component: TaskCancelledComponent;
  let fixture: ComponentFixture<TaskCancelledComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskCancelledComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskCancelledComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task cancelled', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task cancelled/marked as done');
  });
});
