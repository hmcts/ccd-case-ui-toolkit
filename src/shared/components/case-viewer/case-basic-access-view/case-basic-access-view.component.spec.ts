import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { Location } from '@angular/common';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CaseField, CaseView } from '../../../domain';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import { CasesService } from '../../case-editor/services';
import { CaseBasicAccessViewComponent } from './case-basic-access-view.component';
import createSpyObj = jasmine.createSpyObj;
import { Router } from '@angular/router';

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

    beforeEach(async(() => {
        mockCasesService = createSpyObj('casesService', ['getCourtOrHearingCentreName']);
        mockCasesService.getCourtOrHearingCentreName.and.returnValue(of([{building_location_name: 'dummy-location'}]));

        TestBed
        .configureTestingModule({
            imports: [RouterTestingModule.withRoutes([
              { path: '', component: CaseBasicAccessViewComponent },
              { path: 'route-1', component: StubComponent },
              { path: 'route-2', component: StubComponent },
              { path: 'cases/case-loader', component: StubComponent }
            ])],
            declarations: [
                CaseBasicAccessViewComponent,
                CaseReferencePipe,
                StubComponent
            ],
            providers: [
                { provide: CasesService, useValue: mockCasesService },
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        })
        .compileComponents();
        router = TestBed.get(Router);
        location = TestBed.get(Location);
        fixture = TestBed.createComponent(CaseBasicAccessViewComponent);
        component = fixture.componentInstance;
        component.caseDetails = CASE_VIEW_WITH_CHALLENGED_ACCESS;
        de = fixture.debugElement;

        router.initialNavigation();
        fixture.detectChanges();
    }));

    it('should assign court or hearing centre name', () => {
        expect(component.courtOrHearingCentre).toEqual('dummy-location');
    });

    it('should go back 1 level', fakeAsync(() => {
      router.navigate(['/route-1']);
      tick();
      router.navigate(['/route-2']);
      tick();

      component.onCancel();
      tick();
      expect(location.path()).toBe('/route-1');
    }));
});
