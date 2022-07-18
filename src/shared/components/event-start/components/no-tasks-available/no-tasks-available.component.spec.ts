import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NoTasksAvailableComponent } from './no-tasks-available.component';

describe('NoTasksAvalaibleComponent', () => {
  let component: NoTasksAvailableComponent;
  let fixture: ComponentFixture<NoTasksAvailableComponent>;
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
      declarations: [NoTasksAvailableComponent],
      providers: [
        {provide: ActivatedRoute, useValue: mockRoute}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoTasksAvailableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display error message no tasks available', () => {
    const heading: DebugElement = fixture.debugElement.query(By.css('.govuk-heading-m'));
    const headingHtml = heading.nativeElement as HTMLElement;
    expect(headingHtml.innerText).toBe('No task available');
  });
});
