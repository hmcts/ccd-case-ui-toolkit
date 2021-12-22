import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TaskReAssignedComponent } from './task-reassigned.component';

describe('TaskReassignedComponent', () => {
  let component: TaskReAssignedComponent;
  let fixture: ComponentFixture<TaskReAssignedComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskReAssignedComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskReAssignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task assigned to another user', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
  });
});
