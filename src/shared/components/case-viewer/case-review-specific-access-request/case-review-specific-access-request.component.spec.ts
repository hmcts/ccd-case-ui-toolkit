import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, DebugElement, Type } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, ParamMap, Params, Route, Router, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AccessManagementRequestReviewMockModel } from '../../../../app.config';
import { AlertModule } from '../../../../components/banners/alert';
import { ErrorMessageComponent } from '../../error-message';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request.component';
import { ReviewSpecificAccessRequestPageText, ReviewSpecificAccessRequestErrors } from './models';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../..';
import createSpyObj = jasmine.createSpyObj;
import { Location } from '@angular/common';

const ACCESS_MANAGEMENT_REQUEST_REVIEW: AccessManagementRequestReviewMockModel = {
  active: true,
  details: {
    caseName: 'Amelia Chu',
    caseReference: 'PA/00467/2017',
    dateSubmitted: '2021-11-02T14:43:56.576Z',
    reasonForCaseAccess:
      'To view details of the other case linked to the parties/family on my current case.',
    requestFrom: 'Judge Randel-Combeswardly',
  },
};

class MockActivatedRouteSnapshot implements ActivatedRouteSnapshot {
  url: UrlSegment[];
  params: Params;
  queryParams: Params;
  fragment: string;
  data: Data;
  outlet: string;
  component: Type<any> | string | null;
  readonly routeConfig: Route | null;
  readonly root: ActivatedRouteSnapshot;
  readonly parent: ActivatedRouteSnapshot | null;
  readonly firstChild: ActivatedRouteSnapshot | null;
  readonly children: ActivatedRouteSnapshot[];
  readonly pathFromRoot: ActivatedRouteSnapshot[];
  readonly paramMap: ParamMap;
  readonly queryParamMap: ParamMap;
  toString(): string {
    return '';
  }
}

class MockActivatedRoute implements ActivatedRoute {
  snapshot: ActivatedRouteSnapshot;
  url: Observable<UrlSegment[]>;
  params: Observable<Params>;
  queryParams: Observable<Params>;
  fragment: Observable<string>;
  data: Observable<Data>;
  outlet: string;
  component: Type<any> | string;
  routeConfig: Route;
  root: ActivatedRoute;
  parent: ActivatedRoute;
  firstChild: ActivatedRoute;
  children: ActivatedRoute[];
  pathFromRoot: ActivatedRoute[];
  paramMap: Observable<ParamMap>;
  queryParamMap: Observable<ParamMap>;
  toString(): string {
    return '';
  }
}

@Component({template: ``})
class StubComponent {}

describe('CaseSpecificAccessRequestComponent', () => {
  let de: DebugElement;
  let component: CaseReviewSpecificAccessRequestComponent;
  let fixture: ComponentFixture<CaseReviewSpecificAccessRequestComponent>;
  const case_id = '1234123412341234';
  const mockRoute = {
    snapshot: {
      data: {
        case: {
          case_id,
        },
      },
    },
  };
  let mockActivatedRoute = new MockActivatedRoute();
  let mockAppConfig = createSpyObj('AbstractAppConfig', [
    'getAccessManagementMode',
    'getAccessManagementRequestReviewMockModel',
  ]);
  let router: Router;
  let location: Location;

  mockActivatedRoute.snapshot = new MockActivatedRouteSnapshot();
  mockActivatedRoute.snapshot.data = <Data>{};
  mockAppConfig.getAccessManagementMode.and.returnValue(true);
  mockAppConfig.getAccessManagementRequestReviewMockModel.and.returnValue(
    ACCESS_MANAGEMENT_REQUEST_REVIEW
  );

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AlertModule, ReactiveFormsModule,
        [RouterTestingModule.withRoutes([
          { path: '', component: CaseReviewSpecificAccessRequestComponent },
          { path: 'work/my-work/list', component: StubComponent }
        ])]
      ],
      declarations: [
        CaseReviewSpecificAccessRequestComponent,
        ErrorMessageComponent,
        StubComponent
      ],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: AbstractAppConfig, useValue: mockAppConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseReviewSpecificAccessRequestComponent);
    fixture.detectChanges();
    component = fixture.componentInstance;
    component.title = ReviewSpecificAccessRequestPageText.TITLE;
    component.hint = ReviewSpecificAccessRequestPageText.HINT;
    component.caseRefLabel = ReviewSpecificAccessRequestPageText.CASE_REF;
    component.setMockData();
    de = fixture.debugElement;
    fixture.detectChanges();
    router = TestBed.get(Router);
    location = TestBed.get(Location);
    spyOn(router, 'navigate');
  }));

  it('should create component and show the "review access" info message banner', () => {
    const headingElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-fieldset__heading'
    );
    expect(headingElement.textContent).toContain(
      ReviewSpecificAccessRequestPageText.TITLE
    );
    const hintElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-fieldset__legend--m'
    );
    expect(hintElement.textContent).toContain(
      ReviewSpecificAccessRequestPageText.HINT
    );
  });

  it('should show validation error when any radio button selected and the form submitted', () => {
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');

    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(true);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__list'
    );
    expect(errorBannerElement.textContent).toContain(
      ReviewSpecificAccessRequestErrors.NO_SELECTION
    );
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__title'
    );
    expect(errorMessageElement.textContent).toContain(
      ReviewSpecificAccessRequestErrors.GENERIC_ERROR
    );
  });

  it('should clear validation error when a radio button selected and the form submitted', () => {
    const radioButton =
      fixture.debugElement.nativeElement.querySelector('#reason-0');
    radioButton.click();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.invalid).toBe(false);
    let errorBannerElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__list'
    );
    expect(errorBannerElement).toBeNull();
    let errorMessageElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__title'
    );
    expect(errorMessageElement).toBeNull();
  });

  it('should go back to the page before previous one when the Cancel link is clicked', fakeAsync(() => {
    const cancelLink =
      fixture.debugElement.nativeElement.querySelector('a.govuk-body');
    expect(cancelLink.text).toContain('Cancel');
    cancelLink.click();
    tick();
    expect(location.path()).toBe(CaseReviewSpecificAccessRequestComponent.CANCEL_LINK_DESTINATION);
  }));

  it('should make a Reviewed Access request with correct parameters and navigate to the rejected page', () => {
    const radioButton = fixture.debugElement.nativeElement.querySelector('#reason-1');
    radioButton.click();
    fixture.detectChanges();
    const submitButton = fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
    submitButton.click();
    fixture.detectChanges();
    expect(component.formGroup.valid).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['rejected'], {relativeTo: mockRoute});
  });
});
