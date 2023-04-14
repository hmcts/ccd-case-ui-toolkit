import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';
import { AlertModule } from '../../../../components/banners/alert';
import { CaseView, ChallengedAccessRequest } from '../../../domain';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CasesService } from '../../case-editor/services/cases.service';
import { ErrorMessageComponent } from '../../error-message';
import { CaseChallengedAccessRequestComponent } from './case-challenged-access-request.component';
import { ChallengedAccessRequestErrors, ChallengedAccessRequestPageText } from './models';
import { CaseNotifier } from '../../case-editor';
import createSpyObj = jasmine.createSpyObj;

@Component({template: ``})
class StubComponent {}

describe('CaseChallengedAccessRequestComponent', () => {
  let component: CaseChallengedAccessRequestComponent;
  let fixture: ComponentFixture<CaseChallengedAccessRequestComponent>;
  let casesService: jasmine.SpyObj<CasesService>;
  let casesNotifier: jasmine.SpyObj<CaseNotifier>;
  const caseId = '1234123412341234';
  const mockRoute = {
    snapshot: {
      params: {
        cid: caseId
      }
    }
  };
  let router: Router;
  let location: Location;
  beforeEach(waitForAsync(() => {
    casesService = createSpyObj<CasesService>('casesService', ['createChallengedAccessRequest']);
    casesNotifier = createSpyObj<CaseNotifier>('caseNotifier', ['fetchAndRefresh']);
    casesService.createChallengedAccessRequest.and.returnValue(of(true));
    casesNotifier.fetchAndRefresh.and.returnValue(of(new CaseView()));
    TestBed.configureTestingModule({
      imports: [
        AlertModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: CaseChallengedAccessRequestComponent },
          { path: 'work/my-work/list', component: StubComponent }
        ])
      ],
      declarations: [ CaseChallengedAccessRequestComponent, ErrorMessageComponent,StubComponent, MockRpxTranslatePipe ],
      providers: [
        FormBuilder,
        { provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService',
        ['getTranslation', 'translate']) },
        { provide: CasesService, useValue: casesService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseNotifier, useValue: casesNotifier },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseChallengedAccessRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    spyOn(router, 'navigate');
  });

  it('should create component and show the \"challenged access\" info message banner', () => {
    expect(component).toBeDefined();
    const infoBannerElement = fixture.debugElement.nativeElement.querySelector('.hmcts-banner');
    expect(infoBannerElement.textContent).toContain('This case requires challenged access.');
    const headingElement = fixture.debugElement.nativeElement.querySelector('.govuk-fieldset__heading');
    expect(headingElement.textContent).toContain(ChallengedAccessRequestPageText.TITLE);
    const hintElement = fixture.debugElement.nativeElement.querySelector('.govuk-hint');
    expect(hintElement.textContent).toContain(ChallengedAccessRequestPageText.HINT);
  });

  it('should show a validation error if form submitted with no option selected', () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('radioSelected').invalid).toBe(true);
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_SELECTION);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_SELECTION);
  });

  it('should clear the \"no selection\" validation error before form submission when an option is selected', () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('radioSelected').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_SELECTION);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_SELECTION);
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-1');
    radioButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    // Check that the error banner is no longer showing
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    // Check that the error message is no longer showing
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should show a validation error if form submitted with \"linked to current case\" option selected but no Case Reference', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('caseReference').invalid).toBe(true);
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
  });

  it('should clear the \"Case reference\" validation error when another option is selected', () => {
    let radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('caseReference').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-1');
    radioButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should clear the \"Case reference\" validation error when the associated text field is populated and the form submitted', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('caseReference').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    const caseReference = fixture.debugElement.nativeElement.querySelector('#case-reference');
    caseReference.value = 'Test';
    caseReference.dispatchEvent(new Event('input'));
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    expect(component.formGroup.get('caseReference').invalid).toBe(false);
    expect(component.formGroup.get('caseReference').value).toEqual('Test');
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should clear the \"Case reference\" value in the model if another option is selected before returning to this one', () => {
    let radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('caseReference').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    const caseReference = fixture.debugElement.nativeElement.querySelector('#case-reference');
    caseReference.value = 'Test';
    caseReference.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // Select another option
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-1');
    radioButton.click();
    fixture.detectChanges();
    // Check that the "Case reference" value in the model has been cleared
    expect(component.formGroup.get('caseReference').value).toEqual('');
    // Check that the error banner is no longer showing
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    // Check that the error message is no longer showing
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Return to "Case reference" option
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('caseReference').invalid).toBe(true);
    // Check that the error banner is showing again
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
    // Check that the error message is showing again
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_CASE_REFERENCE);
  });

  it('should show a validation error if form submitted with \"Other reason\" option selected but no reason', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('otherReason').invalid).toBe(true);
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
  });

  it('should clear the \"Other reason\" validation error when another option is selected', () => {
    let radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('otherReason').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-2');
    radioButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should clear the \"Other reason\" validation error when the associated text field is populated and the form submitted', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('otherReason').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    const otherReason = fixture.debugElement.nativeElement.querySelector('#other-reason');
    otherReason.value = 'Test';
    otherReason.dispatchEvent(new Event('input'));
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    expect(component.formGroup.get('otherReason').invalid).toBe(false);
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
  });

  it('should clear the \"Other reason\" value in the model if another option is selected before returning to this one', () => {
    let radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('otherReason').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    const otherReason = fixture.debugElement.nativeElement.querySelector('#other-reason');
    otherReason.value = 'Test';
    otherReason.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    // Select another option
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-2');
    radioButton.click();
    fixture.detectChanges();
    // Check that the "Other reason" value in the model has been cleared
    expect(component.formGroup.get('otherReason').value).toEqual('');
    // Check that the error banner is no longer showing
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeNull();
    // Check that the error message is no longer showing
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement).toBeNull();
    // Return to "Other reason" option
    radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('otherReason').invalid).toBe(true);
    // Check that the error banner is showing again
    errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
    // Check that the error message is showing again
    errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(ChallengedAccessRequestErrors.NO_REASON);
  });

  it('should go back to the cancel link destination when the Cancel link is clicked', fakeAsync(() => {
    const cancelLink = fixture.debugElement.nativeElement.querySelector('a.govuk-body');
    expect(cancelLink.text).toContain('Cancel');
    cancelLink.click();
    tick();
    expect(location.path()).toBe(CaseChallengedAccessRequestComponent.CANCEL_LINK_DESTINATION);
  }));

  it('should make a Challenged Access request with correct parameters for the first reason, and navigate to the success page', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    fixture.detectChanges();
    const caseReference = fixture.debugElement.nativeElement.querySelector('#case-reference');
    caseReference.value = '1111222233334444';
    caseReference.dispatchEvent(new Event('input'));
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(component.formGroup.valid).toBe(true);
    expect(casesService.createChallengedAccessRequest).toHaveBeenCalledWith(
      caseId,
      {
        reason: 0,
        caseReference: '1111222233334444',
        otherReason: null
      } as ChallengedAccessRequest);
    expect(router.navigate).toHaveBeenCalledWith(['success'], {relativeTo: mockRoute});
  });

  it('should make a Challenged Access request with correct parameters for the second reason, and navigate to the success page', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-1');
    radioButton.click();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(component.formGroup.valid).toBe(true);
    expect(casesService.createChallengedAccessRequest).toHaveBeenCalledWith(
      caseId,
      {
        reason: 1,
        caseReference: null,
        otherReason: null
      } as ChallengedAccessRequest);
    expect(router.navigate).toHaveBeenCalledWith(['success'], {relativeTo: mockRoute});
  });

  it('should make a Challenged Access request with correct parameters for the third reason, and navigate to the success page', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-2');
    radioButton.click();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(component.formGroup.valid).toBe(true);
    expect(casesService.createChallengedAccessRequest).toHaveBeenCalledWith(
      caseId,
      {
        reason: 2,
        caseReference: null,
        otherReason: null
      } as ChallengedAccessRequest);
    expect(router.navigate).toHaveBeenCalledWith(['success'], {relativeTo: mockRoute});
  });

  it('should make a Challenged Access request with correct parameters for the fourth reason, and navigate to the success page', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-3');
    radioButton.click();
    fixture.detectChanges();
    const otherReason = fixture.debugElement.nativeElement.querySelector('#other-reason');
    otherReason.value = 'Test';
    otherReason.dispatchEvent(new Event('input'));
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    expect(component.formGroup.valid).toBe(true);
    expect(casesService.createChallengedAccessRequest).toHaveBeenCalledWith(
      caseId,
      {
        reason: 3,
        caseReference: null,
        otherReason: 'Test'
      } as ChallengedAccessRequest);
    expect(router.navigate).toHaveBeenCalledWith(['success'], {relativeTo: mockRoute});
  });
});
