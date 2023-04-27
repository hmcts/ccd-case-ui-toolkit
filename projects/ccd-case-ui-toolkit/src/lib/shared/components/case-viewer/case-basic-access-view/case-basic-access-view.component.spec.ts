import { Location } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, CaseView } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CasesService } from '../../case-editor/services';
import { CaseBasicAccessViewComponent } from './case-basic-access-view.component';
import createSpyObj = jasmine.createSpyObj;

const META_DATA_FIELD_WITH_CHALLENGED_ACCESS: CaseField = new CaseField();
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.id = '[ACCESS_PROCESS]';
META_DATA_FIELD_WITH_CHALLENGED_ACCESS.value = 'CHALLENGED';

const CASE_VIEW_WITH_CHALLENGED_ACCESS: CaseView = {
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
                MockRpxTranslatePipe,
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
