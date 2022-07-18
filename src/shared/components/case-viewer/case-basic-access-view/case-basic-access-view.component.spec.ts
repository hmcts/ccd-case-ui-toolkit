import { CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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

describe('CaseBasicAccessViewComponent', () => {
    let fixture: ComponentFixture<CaseBasicAccessViewComponent>;
    let component: CaseBasicAccessViewComponent;
    let de: DebugElement;
    let mockCasesService: any;

    beforeEach(waitForAsync(() => {
        mockCasesService = createSpyObj('casesService', ['getCourtOrHearingCentreName']);
        mockCasesService.getCourtOrHearingCentreName.and.returnValue(of([{building_location_name: 'dummy-location'}]));

        TestBed
        .configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [
                CaseBasicAccessViewComponent,
                CaseReferencePipe
            ],
            providers: [
                { provide: CasesService, useValue: mockCasesService },
            ],
            schemas: [
                CUSTOM_ELEMENTS_SCHEMA
            ]
        })
        .compileComponents();

        fixture = TestBed.createComponent(CaseBasicAccessViewComponent);
        component = fixture.componentInstance;
        component.caseDetails = CASE_VIEW_WITH_CHALLENGED_ACCESS;
        de = fixture.debugElement;
        fixture.detectChanges();
    }));

    it('should assign court or hearing centre name', () => {
        expect(component.courtOrHearingCentre).toEqual('dummy-location');
    });

});
