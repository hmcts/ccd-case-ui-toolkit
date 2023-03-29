import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseReviewSpecificAccessRejectComponent } from './case-review-specific-access-reject.component';

describe('CaseReviewSpecificAccessRejectComponent', () => {
  let component: CaseReviewSpecificAccessRejectComponent;
  let fixture: ComponentFixture<CaseReviewSpecificAccessRejectComponent>;
  const case_id = '1234123412341234';
  const mockRoute = {
    snapshot: {
      data: {
        case: {
          case_id
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, RouterTestingModule],
      declarations: [ CaseReviewSpecificAccessRejectComponent, MockRpxTranslatePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
    fixture = TestBed.createComponent(CaseReviewSpecificAccessRejectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create component and show the correct message', () => {
    expect(component).toBeDefined();
    const confirmationMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-panel__title');
    expect(confirmationMessageElement.textContent).toContain('Request for access denied');
  });

  it('should show the correct message for heading', () => {
    const confirmationMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-heading-m');
    expect(confirmationMessageElement.textContent).toContain('What happens next');
  });

  it('should elements have correct message', () => {
    const tasksElement = fixture.debugElement.nativeElement.querySelector('.govuk-button');
    expect(tasksElement.textContent).toContain('Return to My tasks');
    const myTaskElement = fixture.debugElement.nativeElement.querySelector('.cancel a');
    expect(myTaskElement.textContent).toContain('Return to the Tasks tab for this case');
  });

  it('should have the correct Case Reference in the \"Review specific access\" link URL', () => {
    const myTaskLinkElement = fixture.debugElement.nativeElement.querySelector('.govuk-button');
    expect(myTaskLinkElement.getAttribute('href')).toEqual(`tasks/list`);
    const viewCaseFileLinkElement = fixture.debugElement.nativeElement.querySelector('.cancel a');
    expect(viewCaseFileLinkElement.getAttribute('href')).toEqual(`cases/case-details/${case_id}`);
  });
});
