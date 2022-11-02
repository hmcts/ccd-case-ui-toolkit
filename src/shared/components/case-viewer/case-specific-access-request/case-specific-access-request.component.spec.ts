import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Location } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseNotifier, CasesService } from '../..';
import { AlertModule } from '../../../../components/banners/alert';
import { ErrorMessageComponent } from '../../error-message';
import { CaseSpecificAccessRequestComponent } from './case-specific-access-request.component';
import { SpecificAccessRequestErrors, SpecificAccessRequestPageText } from './models';

import createSpyObj = jasmine.createSpyObj;
import { Component } from '@angular/core';

@Component({template: ``})
class StubComponent {}

describe('CaseSpecificAccessRequestComponent', () => {
  let component: CaseSpecificAccessRequestComponent;
  let fixture: ComponentFixture<CaseSpecificAccessRequestComponent>;
  let casesService: jasmine.SpyObj<CasesService>;
  let casesNotifier: jasmine.SpyObj<CaseNotifier>;
  const case_id = '1234123412341234';
  const mockRoute = {
    snapshot: {
      params: {
        cid: case_id
      }
    }
  };
  let router: Router;
  let location: Location;

  beforeEach(async(() => {
    casesService = createSpyObj<CasesService>('casesService', ['createSpecificAccessRequest']);
    casesService.createSpecificAccessRequest.and.returnValue(of(true));
    TestBed.configureTestingModule({
      imports: [
        AlertModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: CaseSpecificAccessRequestComponent },
          { path: 'work/my-work/list', component: StubComponent }
        ])
      ],
      declarations: [
        CaseSpecificAccessRequestComponent,
        ErrorMessageComponent,
        StubComponent
      ],
      providers: [
        FormBuilder,
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

  it('should go back to the page before previous one when the \"Cancel\" link is clicked', fakeAsync(() => {
    const cancelLink = fixture.debugElement.nativeElement.querySelector('a.govuk-body');
    expect(cancelLink.text).toContain('Cancel');
    cancelLink.click();
    tick();

    expect(location.path()).toBe(CaseSpecificAccessRequestComponent.CANCEL_LINK_DESTINATION);
  }));
});
