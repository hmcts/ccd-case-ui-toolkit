import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';
import { AlertModule } from '../../../../components/banners/alert';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseNotifier } from '../../case-editor';
import { CasesService } from '../../case-editor/services/cases.service';
import { ErrorMessageComponent } from '../../error-message';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request.component';
import { SpecificAccessRequestErrors, SpecificAccessRequestPageText } from './models';

import createSpyObj = jasmine.createSpyObj;

@Component({
    template: ``,
    standalone: false
})
class StubComponent { }

describe('CaseSpecificAccessRequestComponent', () => {
  let component: CaseSpecificAccessRequestComponent;
  let fixture: ComponentFixture<CaseSpecificAccessRequestComponent>;
  let casesService: jasmine.SpyObj<CasesService>;
  const casesNotifier = createSpyObj<CaseNotifier>('CaseNotifier', ['fetchAndRefresh']);
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
    casesService = createSpyObj<CasesService>('casesService', ['createSpecificAccessRequest']);
    casesService.createSpecificAccessRequest.and.returnValue(of(true));
    casesNotifier.fetchAndRefresh.and.returnValue(of(true));
    TestBed.configureTestingModule({
      declarations: [CaseSpecificAccessRequestComponent, ErrorMessageComponent, MockRpxTranslatePipe,
        StubComponent],
      imports: [
        AlertModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: CaseSpecificAccessRequestComponent },
          { path: 'work/my-work/list', component: StubComponent }
        ])
      ],
      providers: [
        FormBuilder,
        {
          provide: RpxTranslationService, useValue: createSpyObj('RpxTranslationService',
            ['getTranslation$', 'translate'])
        },
        { provide: CasesService, useValue: casesService },
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseNotifier, useValue: casesNotifier },
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseSpecificAccessRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    spyOn(router, 'navigate');
  });

  it('should create component and show the \"specific access\" info message banner', () => {
    const infoBannerElement = fixture.debugElement.nativeElement.querySelector('.hmcts-banner');
    expect(infoBannerElement.textContent).toContain('Authorisation is needed to access this case.');
    const headingElement = fixture.debugElement.nativeElement.querySelector('.govuk-fieldset__heading');
    expect(headingElement.textContent).toContain(SpecificAccessRequestPageText.TITLE);
    const hintElement = fixture.debugElement.nativeElement.querySelector('.govuk-hint');
    expect(hintElement.textContent).toContain(SpecificAccessRequestPageText.HINT);
  });

  it('should clear the \"Specific reason\" validation error when the associated text field is populated and the form submitted', () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    expect(component.formGroup.get('specificReason').invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement.textContent).toContain(SpecificAccessRequestErrors.NO_REASON);
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-message');
    expect(errorMessageElement.textContent).toContain(SpecificAccessRequestErrors.NO_REASON);
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

  it('should return error when API call fails', () => {
    casesService.createSpecificAccessRequest.and.returnValue(of({
      errorCode: '500',
      status: '500',
      errorMessage: 'Internal Server Error',
      timeStamp: new Date()
    }));
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    const otherReason = fixture.debugElement.nativeElement.querySelector('#specific-reason');
    otherReason.value = 'Test';
    otherReason.dispatchEvent(new Event('input'));
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector('.govuk-error-summary');
    expect(errorBannerElement).toBeDefined();
  });

  it('should go back to the page before previous one when the \"Cancel\" link is clicked', fakeAsync(() => {
    const cancelLink = fixture.debugElement.nativeElement.querySelector('a.govuk-body');
    expect(cancelLink.text).toContain('Cancel');
    cancelLink.click();
    tick();

    expect(location.path()).toBe(CaseSpecificAccessRequestComponent.CANCEL_LINK_DESTINATION);
  }));
});
