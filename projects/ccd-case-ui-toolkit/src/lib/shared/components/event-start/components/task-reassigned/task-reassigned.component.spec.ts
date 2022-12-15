import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../test/mock-rpx-translate.pipe';
import { TaskReassignedComponent } from './task-reassigned.component';

describe('TaskReassignedComponent', () => {
  let component: TaskReassignedComponent;
  let fixture: ComponentFixture<TaskReassignedComponent>;
  const mockRoute: any = {
    snapshot: {
      data: {
        case: {
          case_id: '1620409659381330'
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [TaskReassignedComponent, MockRpxTranslatePipe],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskReassignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task reassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task reassigned');
  });
});
