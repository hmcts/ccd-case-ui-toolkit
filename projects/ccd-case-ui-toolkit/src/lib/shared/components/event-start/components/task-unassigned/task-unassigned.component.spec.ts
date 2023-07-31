import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../../test/mock-rpx-translate.pipe';
import { TaskUnassignedComponent } from './task-unassigned.component';

describe('TaskUnassignedComponent', () => {
  let component: TaskUnassignedComponent;
  let fixture: ComponentFixture<TaskUnassignedComponent>;
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
      declarations: [TaskUnassignedComponent, MockRpxTranslatePipe],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskUnassignedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message task unassigned', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('Task assignment required');
  });
});
