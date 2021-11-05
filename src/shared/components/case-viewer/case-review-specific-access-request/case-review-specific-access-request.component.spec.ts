import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AlertModule } from '../../../../components/banners/alert';
import { ErrorMessageComponent } from '../../error-message';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request.component';
import { ReviewSpecificAccessRequestPageText, ReviewSpecificAccessRequestErrors } from './models';

describe('CaseSpecificAccessRequestComponent', () => {
  let component: CaseReviewSpecificAccessRequestComponent;
  let fixture: ComponentFixture<CaseReviewSpecificAccessRequestComponent>;
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
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AlertModule, ReactiveFormsModule, RouterTestingModule ],
      declarations: [ CaseReviewSpecificAccessRequestComponent, ErrorMessageComponent ],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseReviewSpecificAccessRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    spyOn(router, 'navigate');
  });

  it('should create component and show the \"review access\" info message banner', () => {
    const infoBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-fieldset__heading');
    expect(infoBannerElement.textContent).toContain(ReviewSpecificAccessRequestPageText.TITLE);
    const headingElement = fixture.debugElement.nativeElement.querySelector('.govuk-fieldset').firstElementChild.children[1].children[0];
    expect(headingElement.textContent).toContain(ReviewSpecificAccessRequestPageText.HINT);

  });

  it('should clear the \"review access reason\" validation error when the associated text field is populated and the form submitted', () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    debugger;

    fixture.debugElement.nativeElement.querySelector('.govuk-error-summary').querySelector('h2')


    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ReviewSpecificAccessRequestErrors.NO_SELECTION);


    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ReviewSpecificAccessRequestErrors.NO_SELECTION);
    
    const otherReason = fixture.debugElement.nativeElement.querySelector('#specific-reason');
    otherReason.value = 'Test';
    otherReason.dispatchEvent(new Event('input'));
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    expect(component.formGroup.get('specificReason').invalid).toBe(false);
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should go back to the page before previous one when the \"Cancel\" link is clicked', () => {
    const cancelLink = fixture.debugElement.nativeElement.querySelector('a.govuk-body');
    expect(cancelLink.text).toContain('Cancel');
    spyOn(window.history, 'go');
    cancelLink.click();
    expect(window.history.go).toHaveBeenCalledWith(-2);
  });
});
