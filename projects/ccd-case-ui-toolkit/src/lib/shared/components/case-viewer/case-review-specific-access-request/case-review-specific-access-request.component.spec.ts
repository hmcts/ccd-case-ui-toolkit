import { Location } from '@angular/common';
import { Component, DebugElement, Type } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, Data, ParamMap, Params, Route, Router, UrlSegment } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs';
import { AbstractAppConfig, AccessManagementRequestReviewMockModel } from '../../../../app.config';
import { AlertModule } from '../../../../components/banners/alert';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { ErrorMessageComponent } from '../../error-message';
import { CaseReviewSpecificAccessRequestComponent } from './case-review-specific-access-request.component';
import { ReviewSpecificAccessRequestErrors, ReviewSpecificAccessRequestPageText } from './models';
import createSpyObj = jasmine.createSpyObj;

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
  public url: UrlSegment[];
  public params: Params;
  public queryParams: Params;
  public fragment: string;
  public data: Data;
  public outlet: string;
  public component: Type<any> | string | null;
  public readonly routeConfig: Route | null;
  public readonly root: ActivatedRouteSnapshot;
  public readonly parent: ActivatedRouteSnapshot | null;
  public readonly firstChild: ActivatedRouteSnapshot | null;
  public readonly children: ActivatedRouteSnapshot[];
  public readonly pathFromRoot: ActivatedRouteSnapshot[];
  public readonly paramMap: ParamMap;
  public readonly queryParamMap: ParamMap;
  public toString(): string {
    return '';
  }
}

class MockActivatedRoute implements ActivatedRoute {
  public snapshot: ActivatedRouteSnapshot;
  public url: Observable<UrlSegment[]>;
  public params: Observable<Params>;
  public queryParams: Observable<Params>;
  public fragment: Observable<string>;
  public data: Observable<Data>;
  public outlet: string;
  public component: Type<any> | string;
  public routeConfig: Route;
  public root: ActivatedRoute;
  public parent: ActivatedRoute;
  public firstChild: ActivatedRoute;
  public children: ActivatedRoute[];
  public pathFromRoot: ActivatedRoute[];
  public paramMap: Observable<ParamMap>;
  public queryParamMap: Observable<ParamMap>;
  public toString(): string {
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
  const mockActivatedRoute = new MockActivatedRoute();
  const mockAppConfig = createSpyObj('AbstractAppConfig', [
    'getAccessManagementMode',
    'getAccessManagementRequestReviewMockModel',
  ]);
  let router: Router;
  let location: Location;

  mockActivatedRoute.snapshot = new MockActivatedRouteSnapshot();
  mockActivatedRoute.snapshot.data = ({} as Data);
  mockAppConfig.getAccessManagementMode.and.returnValue(true);
  mockAppConfig.getAccessManagementRequestReviewMockModel.and.returnValue(
    ACCESS_MANAGEMENT_REQUEST_REVIEW
  );

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        AlertModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          { path: '', component: CaseReviewSpecificAccessRequestComponent },
          { path: 'work/my-work/list', component: StubComponent }
        ])
      ],
      declarations: [
        CaseReviewSpecificAccessRequestComponent,
        ErrorMessageComponent,
        MockRpxTranslatePipe,
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
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__list'
    );
    expect(errorBannerElement.textContent).toContain(
      ReviewSpecificAccessRequestErrors.NO_SELECTION
    );
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector(
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
    const errorBannerElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__list'
    );
    expect(errorBannerElement).toBeNull();
    const errorMessageElement = fixture.debugElement.nativeElement.querySelector(
      '.govuk-error-summary__title'
    );
    expect(errorMessageElement).toBeNull();
  });

  it('should go back to the cancel link destination when the Cancel link is clicked', fakeAsync(() => {
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
