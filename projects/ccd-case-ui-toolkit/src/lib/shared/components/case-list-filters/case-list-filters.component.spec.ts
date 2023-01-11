import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { of } from 'rxjs';
import { CaseTypeLite, Jurisdiction } from '../../domain';
import { DefinitionsService } from '../../services';
import { CaseListFiltersComponent } from './case-list-filters.component';
import createSpyObj = jasmine.createSpyObj;
let mockDefinitionsService: any;

const EVENT_ID_1 = 'ID_1';
const EVENT_NAME_1 = 'Event one';
const EVENT_ID_2 = 'ID_2';
const EVENT_NAME_2 = 'Event two';
const EVENT_ID_3 = 'ID_3';
const EVENT_NAME_3 = 'Event three';

const CASE_TYPES_2: CaseTypeLite[] = [
    {
        id: 'CT1',
        name: 'Case type 1',
        description: '',
        states: [],
        events: [
            {
                id: EVENT_ID_1,
                name: EVENT_NAME_1,
                post_state: 'state_1',
                pre_states: [],
                case_fields: [],
                description: 'description_1',
                order: 1
            },
            {
                id: EVENT_ID_2,
                name: EVENT_NAME_2,
                post_state: 'state_2',
                pre_states: ['pre_state_1', 'pre_state_2'],
                case_fields: [],
                description: 'description_2',
                order: 2
            },
            {
                id: EVENT_ID_3,
                name: EVENT_NAME_3,
                post_state: 'state_3',
                pre_states: [],
                case_fields: [],
                description: 'description_3',
                order: 3
            }
        ],
    },
    {
        id: 'CT2',
        name: 'Case type 2',
        description: '',
        states: [
            {
                id: 'S1',
                name: 'State 1',
                description: ''
            },
            {
                id: 'S2',
                name: 'State 2',
                description: ''
            }
        ],
        events: [],
    },
    {
        id: 'CT3',
        name: 'Case type 3',
        description: '',
        states: [],
        events: [
            {
                id: EVENT_ID_1,
                name: EVENT_NAME_1,
                post_state: 'state_1',
                pre_states: [],
                case_fields: [],
                description: 'description_1',
                order: 1
            }
        ],
    }
];

const JURISDICTION_2: Jurisdiction = {
    id: 'J2',
    name: 'Jurisdiction 2',
    description: '',
    caseTypes: CASE_TYPES_2
};

const workbasketFiltersComponent: any = MockComponent({
    selector: 'ccd-workbasket-filters',
    inputs: [
        'jurisdictions',
        'defaults'
    ], outputs: [
        'onApply',
        'onReset'
    ],
    template: '<div id="CaseListFiltersWorkbasketFilters"></div>'
});

describe('CaseListFiltersComponent', () => {

    let component: CaseListFiltersComponent;
    let fixture: ComponentFixture<CaseListFiltersComponent>;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
        mockDefinitionsService = createSpyObj('mockDefinitionsService', ['getJurisdictions']);
        mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
        TestBed.configureTestingModule({
            declarations: [
                CaseListFiltersComponent,
                workbasketFiltersComponent
            ],
            providers: [
                { provide: DefinitionsService, useValue: mockDefinitionsService }
            ],
        }).compileComponents();
        fixture = TestBed.createComponent(CaseListFiltersComponent);
        component = fixture.componentInstance;
        de = fixture.debugElement;
        fixture.detectChanges();
    }));

    it('should render WorkbasketFilters', () => {
        expect(childComponents().length).toEqual(1);
    });

    it('should pass on WorkbasketFilters apply event emit', () => {
        const mockOnWrapperApply = spyOn(component, 'onWrapperApply');
        childComponents()[0].onApply.emit();
        fixture.detectChanges();
        expect(mockOnWrapperApply).toHaveBeenCalled();
    });

    it('should pass on WorkbasketFilters reset event emit', () => {
        const mockOnWrapperReset = spyOn(component, 'onWrapperReset');
        childComponents()[0].onReset.emit();
        fixture.detectChanges();
        expect(mockOnWrapperReset).toHaveBeenCalled();
    });

    function childComponents(): any[] {
        return fixture.debugElement
            .queryAll(By.directive(workbasketFiltersComponent))
            .map(el => el.componentInstance);
    }
});
