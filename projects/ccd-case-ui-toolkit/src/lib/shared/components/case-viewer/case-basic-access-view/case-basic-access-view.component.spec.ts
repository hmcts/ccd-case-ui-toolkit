import { Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, CaseView } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import { CasesService } from '../../case-editor/services';
import { CaseBasicAccessViewComponent } from './case-basic-access-view.component';
import createSpyObj = jasmine.createSpyObj;

const META_DATA_FIELD_WITH_CHALLENGED_ACCESS: CaseField = new CaseField();
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.id = '[ACCESS_PROCESS]';
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.value = 'CHALLENGED';

const CASE_VIEW_WITH_CHALLENGED_ACCESS: CaseView = {
  case_id: '1234-5678-9012-3456',
  case_type: {
    id: 'case_view_1_type_id',
    name: 'case view 1 type',
    jurisdiction: {
      id: 'case_view_1_jurisdiction_id',
      name: 'case view 1 jurisdiction',
    },
  },
  state: {
    id: 'case_view_1_state_id',
    name: 'case view 1 state',
  },
  channels: [],
  tabs: [],
  triggers: [],
  events: [],
  metadataFields: [META_DATA_FIELD_WITH_CHALLENGED_ACCESS],
  basicFields: {
    caseNameHmctsInternal: 'Dummy vs Dummy',
    caseManagementLocation: {
      baseLocation: 22
    }
  }
};

@Component({template: ``})
class StubComponent {}

describe('CaseBasicAccessViewComponent', () => {
  let fixture: ComponentFixture<CaseBasicAccessViewComponent>;
  let component: CaseBasicAccessViewComponent;
  let de: DebugElement;
  let location: Location;
  let router: Router;
  let mockCasesService: any;

  beforeEach(waitForAsync(() => {
    mockCasesService = createSpyObj('casesService', ['getCourtOrHearingCentreName']);
    mockCasesService.getCourtOrHearingCentreName.and.returnValue(of([{court_name: 'dummy-location'}]));

    TestBed
      .configureTestingModule({
          imports: [
            RouterTestingModule.withRoutes([
              { path: '', component: CaseBasicAccessViewComponent },
              { path: 'route-1', component: StubComponent },
              { path: 'work/my-work/list', component: StubComponent }
            ])
          ],
          declarations: [
              CaseBasicAccessViewComponent,
              CaseReferencePipe,
              StubComponent
          ],
          providers: [
              { provide: CasesService, useValue: mockCasesService },
              Location
          ],
          schemas: [
              CUSTOM_ELEMENTS_SCHEMA
          ]
      })
    .compileComponents();
    router = TestBed.inject(Router);
    location = TestBed.inject(Location);
    fixture = TestBed.createComponent(CaseBasicAccessViewComponent);
    component = fixture.componentInstance;
    component.caseDetails = CASE_VIEW_WITH_CHALLENGED_ACCESS;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should assign court or hearing centre name', () => {
      expect(component.courtOrHearingCentre).toEqual('dummy-location');
  });

  it('should go to "CANCEL_LINK_DESTINATION" onCancel', fakeAsync(() => {
    component.onCancel();
    tick();
    expect(location.path()).toBe(CaseBasicAccessViewComponent.CANCEL_LINK_DESTINATION);
  }));
});

describe('CaseBasicAccessViewComponent - window title', () => {
  let comp: CaseBasicAccessViewComponent;
  let f: ComponentFixture<CaseBasicAccessViewComponent>;
  let d: DebugElement;
  let convertHrefToRouterService;
  let titleServiceMock: jasmine.SpyObj<Title>;
  let mockCasesService: any;

  beforeEach(() => {
    mockCasesService = createSpyObj('casesService', ['getCourtOrHearingCentreName']);
    mockCasesService.getCourtOrHearingCentreName.and.returnValue(of([{court_name: 'dummy-location'}]));

    titleServiceMock = jasmine.createSpyObj<Title>('Title', ['setTitle']);

    convertHrefToRouterService = jasmine.createSpyObj('ConvertHrefToRouterService', ['getHrefMarkdownLinkContent', 'callAngularRouter']);
    convertHrefToRouterService.getHrefMarkdownLinkContent.and.returnValue(of('[Send a new direction](/case/IA/Asylum/1641014744613435/trigger/sendDirection)'));

    TestBed
      .configureTestingModule({
        imports: [
          RouterTestingModule.withRoutes([
            { path: '', component: CaseBasicAccessViewComponent },
            { path: 'route-1', component: StubComponent },
            { path: 'work/my-work/list', component: StubComponent }
          ])
        ],
        declarations: [
          CaseBasicAccessViewComponent,
          CaseReferencePipe,
          StubComponent
        ],
        providers: [
          CaseReferencePipe,
          { provide: CasesService, useValue: mockCasesService },
          Location,
          { provide: Title, useValue: titleServiceMock }
        ],
        schemas: [
          CUSTOM_ELEMENTS_SCHEMA
        ]
      })
      .compileComponents();

    f = TestBed.createComponent(CaseBasicAccessViewComponent);
    comp = f.componentInstance;
    comp.caseDetails = CASE_VIEW_WITH_CHALLENGED_ACCESS;
    d = f.debugElement;
    const router = TestBed.get(Router);
    spyOn(router, 'navigate').and.callFake(() => Promise.resolve(true));
    f.detectChanges();
  });

  it('should set the correct title when caseDetails has a caseNameHmctsInternal property', () => {
    comp.ngOnInit();

    expect(titleServiceMock.setTitle).toHaveBeenCalledWith('Dummy vs Dummy (1234-5678-9012-3456) - HM Courts & Tribunals Service - GOV.UK');
  });

  it('should set the correct title when caseDetails does not have a caseNameHmctsInternal property', () => {
    comp.caseDetails.basicFields = null;

    comp.ngOnInit();

    expect(titleServiceMock.setTitle).toHaveBeenCalledWith('1234-5678-9012-3456 - HM Courts & Tribunals Service - GOV.UK');
  });
});
