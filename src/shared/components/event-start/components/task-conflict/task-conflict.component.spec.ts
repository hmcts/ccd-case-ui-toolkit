import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { TaskConflictComponent } from './task-conflict.component';

describe('TaskConflictComponent', () => {
  let component: TaskConflictComponent;
  let fixture: ComponentFixture<TaskConflictComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskConflictComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskConflictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task conflict', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task conflict');
  });
});
