import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { AccessControlList } from '../../domain/definition/access-control-list.model';
import { CaseEvent } from '../../domain/definition/case-event.model';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { createACL } from '../../fixture/shared.test.fixture';
import { AlertService, DefinitionsService, OrderService, SessionStorageService } from '../../services';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import createSpyObj = jasmine.createSpyObj;

const EVENT_ID_1 = 'ID_1';
const EVENT_NAME_1 = 'Event one';
const EVENT_ID_2 = 'ID_2';
const EVENT_NAME_2 = 'Event two';
const EVENT_ID_3 = 'ID_3';
const EVENT_NAME_3 = 'Event three';

const acl1: AccessControlList = createACL('role1', true, true, true, false);
const acl2: AccessControlList = createACL('role2', true, true, false, false);
const acl3: AccessControlList = createACL('role3', false, true, false, false);
let sessionStorageService: any;

const CASE_TYPES_1: CaseTypeLite[] = [
  {
    id: 'CT0',
    name: 'Case type 0',
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
        order: 1,
        acls: [acl1, acl2]
      },
      {
        id: EVENT_ID_2,
        name: EVENT_NAME_2,
        post_state: 'state_2',
        pre_states: ['pre_state_1', 'pre_state_2'],
        case_fields: [],
        description: 'description_2',
        order: 2,
        acls: [acl2, acl3]
      },
      {
        id: EVENT_ID_3,
        name: EVENT_NAME_3,
        post_state: 'state_3',
        pre_states: [],
        case_fields: [],
        description: 'description_3',
        order: 3,
        acls: [acl1, acl2]
      }
    ],
  }
];

const JURISDICTION_1: Jurisdiction = {
  id: 'J1',
  name: 'Jurisdiction 1',
  description: '',
  caseTypes: CASE_TYPES_1
};

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
        order: 1,
        acls: [acl1, acl2]
      },
      {
        id: EVENT_ID_2,
        name: EVENT_NAME_2,
        post_state: 'state_2',
        pre_states: ['pre_state_1', 'pre_state_2'],
        case_fields: [],
        description: 'description_2',
        order: 2,
        acls: [acl2, acl3]
      },
      {
        id: EVENT_ID_3,
        name: EVENT_NAME_3,
        post_state: 'state_3',
        pre_states: [],
        case_fields: [],
        description: 'description_3',
        order: 3,
        acls: [acl1, acl2]
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
        order: 1,
        acls: [acl1, acl2]
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

const SINGLE_EVENT: CaseEvent[] = [{
  id: EVENT_ID_1,
  name: EVENT_NAME_1,
  post_state: 'state_1',
  pre_states: [],
  case_fields: [],
  description: 'description_1',
  order: 1,
  acls: [acl1, acl2]
}];

const CASE_TYPES_SINGLE_EVENT: CaseTypeLite[] = [
  {
    id: 'CT0',
    name: 'Case type 0',
    description: '',
    states: [],
    events: [...SINGLE_EVENT],
  }
];

const JURISDICTION_SINGLE_EVENT: Jurisdiction = {
  id: 'J2',
  name: 'Jurisdiction 2',
  description: '',
  caseTypes: CASE_TYPES_SINGLE_EVENT
};

const CASE_TYPE: CaseTypeLite = {
  id: 'CT3',
  name: 'Complex Address Book Case',
  events: [
    {
      id: EVENT_ID_1,
      name: EVENT_NAME_1,
      post_state: 'state_1',
      pre_states: [],
      case_fields: [],
      description: 'description_1',
      order: 1,
      acls: [acl1, acl2]
    },
    {
      id: EVENT_ID_2,
      name: EVENT_NAME_2,
      post_state: 'state_2',
      pre_states: ['pre_state_1', 'pre_state_2'],
      case_fields: [],
      description: 'description_2',
      order: 2,
      acls: [acl2, acl3]
    },
    {
      id: EVENT_ID_3,
      name: EVENT_NAME_3,
      post_state: 'state_3',
      pre_states: [],
      case_fields: [],
      description: 'description_3',
      order: 3,
      acls: [acl1, acl2]
    }
  ],
  states: [],
  description: 'Complex Address Book Case',
};

const CASE_EVENTS_NO_PRE_STATES: CaseEvent[] = [
  {
    id: EVENT_ID_1,
    name: EVENT_NAME_1,
    post_state: 'state_1',
    pre_states: [],
    case_fields: [],
    description: 'description_1',
    order: 1,
    acls: [acl1, acl2]
  },
  {
    id: EVENT_ID_3,
    name: EVENT_NAME_3,
    post_state: 'state_3',
    pre_states: [],
    case_fields: [],
    description: 'description_3',
    order: 3,
    acls: [acl1, acl2]
  }
];

const SORTED_CASE_EVENTS: CaseEvent[] = [...CASE_EVENTS_NO_PRE_STATES];

const FILTERED_CASE_EVENTS: CaseEvent[] = [{
  id: EVENT_ID_3,
  name: EVENT_NAME_3,
  post_state: 'state_3',
  pre_states: [],
  case_fields: [],
  description: 'description_3',
  order: 3,
  acls: [acl1, acl3]
}];

let mockDefinitionsService: any;
let mockOrderService: any;
let mockAlertService: any;

const TEST_FORM_GROUP = new FormGroup({});

const changeDummy = (jurisdictions) => {
  return {
    jurisdictions: {
      isFirstChange: () => true,
      previousValue: null,
      firstChange: true,
      currentValue: jurisdictions
    }
  };
};

describe('CreateCaseFiltersComponent', () => {

  let fixture: ComponentFixture<CreateCaseFiltersComponent>;
  let component: CreateCaseFiltersComponent;
  let de: DebugElement;

  const $SELECT_JURISDICTION = By.css('#cc-jurisdiction');
  const $SELECT_CASE_TYPE = By.css('#cc-case-type');
  const $SELECT_EVENT = By.css('#cc-event');
  const $SELECT_BUTTON = By.css('button');

  beforeEach(() => {
    mockOrderService = createSpyObj<OrderService>('orderService', ['sort']);
    mockOrderService.sort.and.returnValue(SORTED_CASE_EVENTS);
    mockAlertService = createSpyObj<AlertService>('alertService', ['clear']);
    mockDefinitionsService = createSpyObj('mockDefinitionsService', ['getJurisdictions']);
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(`{"id": 1, "forename": "Firstname", "surname": "Surname",
      "roles": ["role1", "role3"], "email": "test@mail.com","token": null}`);

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule
        ],
        declarations: [
          CreateCaseFiltersComponent,
          MockRpxTranslatePipe
        ], providers: [
          { provide: OrderService, useValue: mockOrderService },
          { provide: AlertService, useValue: mockAlertService },
          { provide: DefinitionsService, useValue: mockDefinitionsService },
          { provide: SessionStorageService, useValue: sessionStorageService}
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateCaseFiltersComponent);
    component = fixture.componentInstance;
    component.jurisdictions = [];
    component.formGroup = TEST_FORM_GROUP;

    de = fixture.debugElement;
    fixture.detectChanges();
    component.initControls();
  });

  it('should select the jurisdiction if there is only one jurisdiction', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_1.id);
  });

  it('should select the caseType if there is only one caseType', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_1.id);
    expect(component.filterCaseTypeControl.value).toBe('CT0');
  });

  it('should select the event if there is only one event', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_SINGLE_EVENT]));
    mockOrderService.sort.and.returnValue(SINGLE_EVENT);
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_SINGLE_EVENT.id);
    expect(component.filterCaseTypeControl.value).toBe('CT0');
    expect(component.filterEventControl.value).toBe(EVENT_ID_1);
  });

  it('should sort events', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_1.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_1[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();
    expect(mockOrderService.sort).toHaveBeenCalledWith(CASE_EVENTS_NO_PRE_STATES);
    expect(component.selectedCaseTypeEvents).toBe(SORTED_CASE_EVENTS);
  });

  it('should return blank list of events when user doesnt have create access', () => {
    sessionStorageService.getItem.and.returnValue(`{"id": 1, "forename": "Firstname", "surname": "Surname",
      "roles": ["role3"], "email": "test@mail.com","token": null}`);
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_1.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_1[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();
    expect(mockOrderService.sort).toHaveBeenCalledWith([]);
  });

  it('should return events list based on the create access to user', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1]));
    mockOrderService.sort.and.returnValue(FILTERED_CASE_EVENTS);
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_1.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_1[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();
    expect(mockOrderService.sort).toHaveBeenCalledWith(CASE_EVENTS_NO_PRE_STATES);
    expect(component.selectedCaseTypeEvents).toBe(FILTERED_CASE_EVENTS);
  });

  it('should initialise jurisdiction selector with given jurisdictions and no selection', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1, JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();
    const selector = de.query($SELECT_JURISDICTION);

    expect(selector.nativeElement.selectedIndex).toEqual(0);
    expect(component.selected.jurisdiction).toBeUndefined();

    expect(selector.children.length).toEqual(3);
    const selectJurisdiction = selector.children[0];

    expect(selectJurisdiction.nativeElement.textContent).toEqual('--Select a value--');
    const juris1 = selector.children[1];

    expect(juris1.nativeElement.textContent).toEqual(JURISDICTION_1.name);
    const juris2 = selector.children[2];

    expect(juris2.nativeElement.textContent).toEqual(JURISDICTION_2.name);
  });

  it('should update selected jurisdiction', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_SINGLE_EVENT]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_SINGLE_EVENT.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    const selector = de.query($SELECT_JURISDICTION);
    expect(selector.nativeElement.selectedIndex).toEqual(1);
    expect(selector.nativeElement.value).toBe(JURISDICTION_SINGLE_EVENT.id);
    expect(component.selected.jurisdiction).toBe(JURISDICTION_SINGLE_EVENT);
  }));

  it('should initialise case type selector with types from selected jurisdiction but no events', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    const selector = de.query($SELECT_CASE_TYPE);

    expect(selector.children.length).toEqual(4);

    const selectCaseType = selector.children[0];
    expect(selectCaseType.nativeElement.textContent).toEqual('--Select a value--');
    const ct1 = selector.children[1];
    expect(ct1.nativeElement.textContent).toEqual(CASE_TYPES_2[0].name);
    const ct2 = selector.children[2];
    expect(ct2.nativeElement.textContent).toEqual(CASE_TYPES_2[1].name);
    const ct3 = selector.children[3];
    expect(ct3.nativeElement.textContent).toEqual(CASE_TYPES_2[2].name);

    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();
  }));

  it('should update selected case type', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[2].id);
    fixture.detectChanges();

    const selector = de.query($SELECT_CASE_TYPE);
    expect(selector.nativeElement.selectedIndex).toEqual(3);
    expect(selector.nativeElement.value).toBe(CASE_TYPES_2[2].id);
  }));

  it('should disable case type and event if jurisdiction not selected', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_1, JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();
    const caseTypeSelector = de.query($SELECT_CASE_TYPE);
    expect(caseTypeSelector.nativeElement.selectedIndex).toEqual(0);
    expect(caseTypeSelector.nativeElement.value).toBe('');
    expect(caseTypeSelector.nativeElement.isEnabled).toBeFalsy();
    expect(caseTypeSelector.children.length).toEqual(1);

    const caseTypeSelectEvent0 = caseTypeSelector.children[0];
    expect(caseTypeSelectEvent0.nativeElement.value).toBe('');
    expect(caseTypeSelectEvent0.nativeElement.textContent).toEqual('--Select a value--');

    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

    const eventSelectEvent0 = eventSelector.children[0];
    expect(eventSelectEvent0.nativeElement.value).toBe('');
    expect(eventSelectEvent0.nativeElement.textContent).toEqual('--Select a value--');
  }));

  it('should initialise event selector from case type with no pre states', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[2].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    const selector = de.query($SELECT_EVENT);

    expect(selector.children.length).toEqual(3);
    const selectEvent0 = selector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    const selectEvent1 = selector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    const selectEvent2 = selector.children[2];
    expect(selectEvent2.nativeElement.value).toBe(EVENT_ID_3);
    expect(selectEvent2.nativeElement.textContent).toEqual(EVENT_NAME_3);
  }));

  it('should reset case type back to empty disabled if set before and jurisdiction changed to empty', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    const caseTypeSelector = de.query($SELECT_CASE_TYPE);
    expect(caseTypeSelector.children.length).toEqual(4);
    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);

    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(caseTypeSelector.children.length).toEqual(1);
    expect(caseTypeSelector.nativeElement.isEnabled).toBeFalsy();

    expect(eventSelector.children.length).toEqual(1);
    const selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();
  }));

  it('should reset event back to default if set before and case type changed', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(3);
    const selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    const selectEvent1 = eventSelector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    const selectEvent2 = eventSelector.children[2];
    expect(selectEvent2.nativeElement.value).toBe(EVENT_ID_3);
    expect(selectEvent2.nativeElement.textContent).toEqual(EVENT_NAME_3);

    component.filterCaseTypeControl.setValue('');
    component.onCaseTypeIdChange();
    fixture.detectChanges();

    expect(eventSelector.children.length).toEqual(1);
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

  }));

  it('should reset event back to default if set before and jurisdiction changed', waitForAsync(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(3);
    const selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    const selectEvent1 = eventSelector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    const selectEvent2 = eventSelector.children[2];
    expect(selectEvent2.nativeElement.value).toBe(EVENT_ID_3);
    expect(selectEvent2.nativeElement.textContent).toEqual(EVENT_NAME_3);

    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(eventSelector.children.length).toEqual(1);
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

  }));

  it('should disable event if case type not selected', waitForAsync(() => {
    component.filterCaseTypeControl.setValue('');
    component.onCaseTypeIdChange();

    const eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

    expect(eventSelector.children.length).toEqual(1);
    const selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
  }));

  it('should have an Go button disabled when event is not set', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = null;
    component.filterEventControl.setValue('');

    component.onEventIdChange();

    fixture.detectChanges();
    const button = de.query($SELECT_BUTTON);
    expect(button.nativeElement.disabled).toBeTruthy();
  }));

  it('should have an Go button enabled when event is set', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);

    component.onEventIdChange();

    fixture.detectChanges();
    const button = de.query($SELECT_BUTTON);
    expect(button.nativeElement.disabled).toBeFalsy();
  }));

  it('should return selected object when form fields selected and Go button clicked', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();

    spyOn(component.selectionSubmitted, 'emit');

    fixture.detectChanges();
    const button = de.query($SELECT_BUTTON);
    button.nativeElement.click();

    expect(component.selectionSubmitted.emit).toHaveBeenCalledWith({
      jurisdictionId: JURISDICTION_2.id,
      caseTypeId: CASE_TYPES_2[2].id,
      eventId: EVENT_ID_2
    });

  }));

});
