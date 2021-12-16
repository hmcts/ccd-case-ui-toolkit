import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleTasksExistComponent } from './multiple-tasks-exist.component';
import { RouterTestingModule } from '@angular/router/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('MultipleTasksExistComponent', () => {
  let component: MultipleTasksExistComponent;
  let fixture: ComponentFixture<MultipleTasksExistComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MultipleTasksExistComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultipleTasksExistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message multiple-tasks-exist', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'))
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Multiple tasks exist');
  });
});
