import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../test/mock-rpx-translate.pipe';
import { TaskConflictComponent } from './task-conflict.component';

describe('TaskConflictComponent', () => {
  let component: TaskConflictComponent;
  let fixture: ComponentFixture<TaskConflictComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskConflictComponent, MockRpxTranslatePipe]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskConflictComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task conflict', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task conflict');
  });
});
