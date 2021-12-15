import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoTasksAvailableComponent } from './no-tasks-available.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('NoTasksAvalaibleComponent', () => {
  let component: NoTasksAvailableComponent;
  let fixture: ComponentFixture<NoTasksAvailableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [NoTasksAvailableComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoTasksAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message no tasks available', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('No task available');
  });
});
