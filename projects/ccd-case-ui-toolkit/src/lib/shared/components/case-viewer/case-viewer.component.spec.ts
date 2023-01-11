import { CUSTOM_ELEMENTS_SCHEMA, DebugElement, Type } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  ActivatedRouteSnapshot,
  Data,
  ParamMap,
  Params,
  Route,
  UrlSegment
} from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { CaseNotifier } from '..';
import { CaseField, CaseView } from '../..';
import { AbstractAppConfig } from '../../../app.config';
import { CaseViewerComponent } from './case-viewer.component';
import createSpyObj = jasmine.createSpyObj;

const CASE_VIEW_FROM_ROUTE: CaseView = {
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
  metadataFields: [],
};

const META_DATA_FIELD_WITH_CHALLENGED_ACCESS: CaseField = new CaseField();
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.id = '[ACCESS_PROCESS]';
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.value = 'CHALLENGED';

const CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS: CaseView = {
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
};

const CASE_VIEW_FROM_CASE_NOTIFIER: CaseView = {
  case_type: {
    id: 'case_view_2_type_id',
    name: 'case view 2 type',
    jurisdiction: {
      id: 'case_view_2_jurisdiction_id',
      name: 'case view 2 jurisdiction',
    },
  },
  state: {
    id: 'case_view_2_state_id',
    name: 'case view 2 state',
  },
  channels: [],
  tabs: [],
  triggers: [],
  events: [],
  metadataFields: [],
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

describe('CaseViewerComponent', () => {
  let fixture: ComponentFixture<CaseViewerComponent>;
  let component: CaseViewerComponent;
  let de: DebugElement;

  const mockActivatedRoute = new MockActivatedRoute();
  let casesService: any;
  casesService = createSpyObj('casesService', ['getCaseViewV2']);
  const mockAppConfig = createSpyObj('AbstractAppConfig', [
    'getAccessManagementMode',
    'getAccessManagementBasicViewMock'
  ]);

  const mockCaseNotifier = new CaseNotifier(casesService);
  mockCaseNotifier.caseView = new BehaviorSubject(null).asObservable();

  mockActivatedRoute.snapshot = new MockActivatedRouteSnapshot();
  mockActivatedRoute.snapshot.data = {} as Data;

  mockAppConfig.getAccessManagementMode.and.returnValue(false);
  mockAppConfig.getAccessManagementBasicViewMock.and.returnValue({active: false});

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaseViewerComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CaseNotifier, useValue: mockCaseNotifier },
        { provide: AbstractAppConfig, useValue: mockAppConfig },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CaseViewerComponent);
    component = fixture.componentInstance;
    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  describe('isDataLoaded()', () => {
    it('should return false if caseDetails is null', () => {
      expect(component.isDataLoaded()).toBeFalsy();
    });

    it('should return true if caseDetails is full', () => {
      mockActivatedRoute.snapshot.data = { case: CASE_VIEW_FROM_ROUTE } as Data;
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.isDataLoaded()).toBeTruthy();
    });
  });

  describe('loadCaseDetails()', () => {
    it('should assign caseDetails in activatedRoute', () => {
      mockActivatedRoute.snapshot.data = { case: CASE_VIEW_FROM_ROUTE } as Data;
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.caseDetails.case_type.id).toEqual('case_view_1_type_id');
    });

    it('should check caseNotifier if caseDetails is not in activatedRoute', () => {
      mockActivatedRoute.snapshot.data = {} as Data;
      mockCaseNotifier.caseView = new BehaviorSubject(
        CASE_VIEW_FROM_CASE_NOTIFIER
      ).asObservable();
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.caseDetails.case_type.id).toEqual('case_view_2_type_id');
    });
  });

  describe('hasStandardAccess()', () => {
    it('should return true if feature toggling is false', () => {
      expect(component.hasStandardAccess()).toBeTruthy();
    });

    it('should return true if feature toggling is true and user has access other than CHALLENGED or SPECIFIC', () => {
      mockActivatedRoute.snapshot.data = { case: CASE_VIEW_FROM_ROUTE } as Data;
      mockAppConfig.getAccessManagementMode.and.returnValue(true);
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.hasStandardAccess()).toBeTruthy();
    });

    it('should return false if feature toggling is true and user has BASIC access granted', () => {
      const META_DATA_FIELD_WITH_BASIC_ACCESS: CaseField = new CaseField();
      META_DATA_FIELD_WITH_BASIC_ACCESS.id = '[ACCESS_GRANTED]';
      META_DATA_FIELD_WITH_BASIC_ACCESS.value = 'BASIC';
      CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS.metadataFields.push(META_DATA_FIELD_WITH_BASIC_ACCESS);

      mockActivatedRoute.snapshot.data = {
        case: CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS,
      } as Data;
      mockAppConfig.getAccessManagementMode.and.returnValue(true);
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.hasStandardAccess()).toBeFalsy();
      CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS.metadataFields.pop();
    });

    it('should return true if feature toggling is true and user has any other access granted', () => {
      const META_DATA_FIELD_WITH_BASIC_ACCESS: CaseField = new CaseField();
      META_DATA_FIELD_WITH_BASIC_ACCESS.id = '[ACCESS_GRANTED]';
      META_DATA_FIELD_WITH_BASIC_ACCESS.value = 'BASIC,CHALLENGED,STANDARD';
      CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS.metadataFields.push(META_DATA_FIELD_WITH_BASIC_ACCESS);

      mockActivatedRoute.snapshot.data = {
        case: CASE_VIEW_FROM_ROUTE_WITH_CHALLENGED_ACCESS,
      } as Data;
      mockAppConfig.getAccessManagementMode.and.returnValue(true);
      fixture.detectChanges();
      component.loadCaseDetails();
      expect(component.hasStandardAccess()).toBeTruthy();
    });
  });
});
