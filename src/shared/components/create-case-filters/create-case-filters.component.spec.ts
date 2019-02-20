import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement, EventEmitter, Input, Output } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateCaseFiltersComponent } from './create-case-filters.component';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { CaseTypeLite } from '../../domain/definition/case-type-lite.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { CaseEvent } from '../../domain/definition/case-event.model';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { AlertService } from '../../services/alert/alert.service';
import { DefinitionsService } from '../../services/definitions/definitions.service';
import { text, attr } from '../../test/helpers';
import { CallbackErrorsContext } from '../error/domain/error-context';
import { CaseViewerComponent } from '../case-viewer/case-viewer.component';
import { HttpError } from '../../domain/http/http-error.model';

const EVENT_ID_1 = 'ID_1';
const EVENT_NAME_1 = 'Event one';
const EVENT_ID_2 = 'ID_2';
const EVENT_NAME_2 = 'Event two';
const EVENT_ID_3 = 'ID_3';
const EVENT_NAME_3 = 'Event three';

const CASE_TYPES_1: CaseTypeLite[] = [
    {
      id: 'CT0',
      name: 'Case type 0',
      description: '',
      states: [],
      events: [
        { id: EVENT_ID_1,
          name: EVENT_NAME_1,
          post_state: 'state_1',
          pre_states: [],
          case_fields: [],
          description: 'description_1',
          order: 1
        },
        { id: EVENT_ID_2,
          name: EVENT_NAME_2,
          post_state: 'state_2',
          pre_states: ['pre_state_1', 'pre_state_2'],
          case_fields: [],
          description: 'description_2',
          order: 2
        },
        { id: EVENT_ID_3,
          name: EVENT_NAME_3,
          post_state: 'state_3',
          pre_states: [],
          case_fields: [],
          description: 'description_3',
          order: 3
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
      { id: EVENT_ID_1,
        name: EVENT_NAME_1,
        post_state: 'state_1',
        pre_states: [],
        case_fields: [],
        description: 'description_1',
        order: 1
      },
      { id: EVENT_ID_2,
        name: EVENT_NAME_2,
        post_state: 'state_2',
        pre_states: ['pre_state_1', 'pre_state_2'],
        case_fields: [],
        description: 'description_2',
        order: 2
      },
      { id: EVENT_ID_3,
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
    {   id: EVENT_ID_1,
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

const SINGLE_EVENT: CaseEvent[] = [{
  id: EVENT_ID_1,
  name: EVENT_NAME_1,
  post_state: 'state_1',
  pre_states: [],
  case_fields: [],
  description: 'description_1',
  order: 1
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
    { id: EVENT_ID_1,
      name: EVENT_NAME_1,
      post_state: 'state_1',
      pre_states: [],
      case_fields: [],
      description: 'description_1',
      order: 1
    },
    { id: EVENT_ID_2,
      name: EVENT_NAME_2,
      post_state: 'state_2',
      pre_states: ['pre_state_1', 'pre_state_2'],
      case_fields: [],
      description: 'description_2',
      order: 2
    },
    { id: EVENT_ID_3,
      name: EVENT_NAME_3,
      post_state: 'state_3',
      pre_states: [],
      case_fields: [],
      description: 'description_3',
      order: 3
    }
  ],
  states: [],
  description: 'Complex Address Book Case',
};

const CASE_EVENTS_NO_PRE_STATES: CaseEvent[] = [
  { id: EVENT_ID_1,
    name: EVENT_NAME_1,
    post_state: 'state_1',
    pre_states: [],
    case_fields: [],
    description: 'description_1',
    order: 1
  },
  { id: EVENT_ID_3,
    name: EVENT_NAME_3,
    post_state: 'state_3',
    pre_states: [],
    case_fields: [],
    description: 'description_3',
    order: 3
  }
];

const SORTED_CASE_EVENTS: CaseEvent[] = [...CASE_EVENTS_NO_PRE_STATES];

@Component({
  selector: 'ccd-callback-errors',
  template: ``
})
class CallbackErrorsComponent {

  @Input()
  triggerTextIgnore: string;
  @Input()
  triggerTextContinue: string;
  @Input()
  callbackErrorsSubject: Subject<any> = new Subject();
  @Output()
  callbackErrorsContext: EventEmitter<any> = new EventEmitter();

}

let mockDefinitionsService;
let mockRouter: any;
let mockOrderService: any;
let mockCallbackErrorSubject: any;
let mockAlertService: any;
let jurisdictionService: JurisdictionService;

const TEST_FORM_GROUP = new FormGroup({});

describe('CreateCaseFiltersComponent', () => {

  let fixture: ComponentFixture<CreateCaseFiltersComponent>;
  let component: CreateCaseFiltersComponent;
  let de: DebugElement;

  const $SELECT_JURISDICTION = By.css('#cc-jurisdiction');
  const $SELECT_CASE_TYPE = By.css('#cc-case-type');
  const $SELECT_EVENT = By.css('#cc-event');
  const $SELECT_BUTTON = By.css('button');
  const $ERROR_SUMMARY = By.css('.error-summary');
  const $ERROR_MESSAGE = By.css('p');
  const $ERROR_FIELD_MESSAGES = By.css('ul');
  const $SUBMIT_BUTTON = By.css('form button[type=submit]');

  beforeEach(async(() => {
    mockOrderService = createSpyObj<OrderService>('orderService', ['sort']);
    mockOrderService.sort.and.returnValue(SORTED_CASE_EVENTS);
    mockDefinitionsService = createSpyObj('mockDefinitionsService', ['getJurisdictions']);
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    mockRouter = createSpyObj<Router>('router', ['navigate']);
    mockRouter.navigate.and.returnValue(Promise.resolve(true));
    mockCallbackErrorSubject = createSpyObj<any>('callbackErrorSubject', ['next']);
    mockAlertService = createSpyObj<AlertService>('alertService', ['clear']);
    jurisdictionService = new JurisdictionService();

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule
        ],
        declarations: [
          CreateCaseFiltersComponent,
          CallbackErrorsComponent
        ], providers: [
          { provide: Router, useValue: mockRouter },
          { provide: OrderService, useValue: mockOrderService },
          { provide: AlertService, useValue: mockAlertService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: DefinitionsService, useValue: mockDefinitionsService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateCaseFiltersComponent);
    component = fixture.componentInstance;
    component.formGroup = TEST_FORM_GROUP;
    component.callbackErrorsSubject = mockCallbackErrorSubject;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should select the jurisdiction if there is only one jurisdiction', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_1.id);
  });

  it('should select the caseType if there is only one caseType', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_1]));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_1.id);
    expect(component.filterCaseTypeControl.value).toBe('CT0');
  });

  it('should select the event if there is only one event', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_SINGLE_EVENT]));
    mockOrderService.sort.and.returnValue(SINGLE_EVENT);
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.filterJurisdictionControl.value).toBe(JURISDICTION_SINGLE_EVENT.id);
    expect(component.filterCaseTypeControl.value).toBe('CT0');
    expect(component.filterEventControl.value).toBe(EVENT_ID_1);
  });

  it('should sort events', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_1]));
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

  it('should initialise jurisdiction selector with given jurisdictions and no selection', () => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_1, JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();
    let selector = de.query($SELECT_JURISDICTION);

    expect(selector.nativeElement.selectedIndex).toEqual(0);
    expect(component.selected.jurisdiction).toBeUndefined();

    expect(selector.children.length).toEqual(3);
    let selectJurisdiction = selector.children[0];

    expect(selectJurisdiction.nativeElement.textContent).toEqual('--Select a value--');
    let juris1 = selector.children[1];

    expect(juris1.nativeElement.textContent).toEqual(JURISDICTION_1.name);
    let juris2 = selector.children[2];

    expect(juris2.nativeElement.textContent).toEqual(JURISDICTION_2.name);
  });

  it('should update selected jurisdiction', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_SINGLE_EVENT]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_SINGLE_EVENT.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    let selector = de.query($SELECT_JURISDICTION);
    expect(selector.nativeElement.selectedIndex).toEqual(1);
    expect(selector.nativeElement.value).toBe(JURISDICTION_SINGLE_EVENT.id);
    expect(component.selected.jurisdiction).toBe(JURISDICTION_SINGLE_EVENT);
  }));

  it('should initialise case type selector with types from selected jurisdiction but no events', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    let selector = de.query($SELECT_CASE_TYPE);

    expect(selector.children.length).toEqual(4);

    let selectCaseType = selector.children[0];
    expect(selectCaseType.nativeElement.textContent).toEqual('--Select a value--');
    let ct1 = selector.children[1];
    expect(ct1.nativeElement.textContent).toEqual(CASE_TYPES_2[0].name);
    let ct2 = selector.children[2];
    expect(ct2.nativeElement.textContent).toEqual(CASE_TYPES_2[1].name);
    let ct3 = selector.children[3];
    expect(ct3.nativeElement.textContent).toEqual(CASE_TYPES_2[2].name);

    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();
  }));

  it('should update selected case type', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[2].id);
    fixture.detectChanges();

    let selector = de.query($SELECT_CASE_TYPE);
    expect(selector.nativeElement.selectedIndex).toEqual(3);
    expect(selector.nativeElement.value).toBe(CASE_TYPES_2[2].id);
  }));

  it('should disable case type and event if jurisdiction not selected', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_1, JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();
    let caseTypeSelector = de.query($SELECT_CASE_TYPE);
    expect(caseTypeSelector.nativeElement.selectedIndex).toEqual(0);
    expect(caseTypeSelector.nativeElement.value).toBe('');
    expect(caseTypeSelector.nativeElement.isEnabled).toBeFalsy();
    expect(caseTypeSelector.children.length).toEqual(1);

    let caseTypeSelectEvent0 = caseTypeSelector.children[0];
    expect(caseTypeSelectEvent0.nativeElement.value).toBe('');
    expect(caseTypeSelectEvent0.nativeElement.textContent).toEqual('--Select a value--');

    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

    let eventSelectEvent0 = eventSelector.children[0];
    expect(eventSelectEvent0.nativeElement.value).toBe('');
    expect(eventSelectEvent0.nativeElement.textContent).toEqual('--Select a value--');
  }));

  it('should initialise event selector from case type with no pre states', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[2].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    let selector = de.query($SELECT_EVENT);

    expect(selector.children.length).toEqual(3);
    let selectEvent0 = selector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    let selectEvent1 = selector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    let selectEvent2 = selector.children[2];
    expect(selectEvent2.nativeElement.value).toBe(EVENT_ID_3);
    expect(selectEvent2.nativeElement.textContent).toEqual(EVENT_NAME_3);
  }));

  it('should disable event if case type not selected', async(() => {
    component.filterCaseTypeControl.setValue('');
    component.onCaseTypeIdChange();

    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.nativeElement.selectedIndex).toEqual(0);
    expect(eventSelector.nativeElement.value).toBe('');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();

    expect(eventSelector.children.length).toEqual(1);
    let selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
  }));

  it('should reset case type back to empty disabled if set before and jurisdiction changed to empty', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    let caseTypeSelector = de.query($SELECT_CASE_TYPE);
    expect(caseTypeSelector.children.length).toEqual(4);
    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(1);

    component.filterJurisdictionControl.setValue('');
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(caseTypeSelector.children.length).toEqual(1);
    expect(caseTypeSelector.nativeElement.isEnabled).toBeFalsy();

    expect(eventSelector.children.length).toEqual(1);
    let selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    expect(eventSelector.nativeElement.isEnabled).toBeFalsy();
  }));

  it('should reset event back to default if set before and case type changed', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(3);
    let selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    let selectEvent1 = eventSelector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    let selectEvent2 = eventSelector.children[2];
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

  it('should reset event back to default if set before and jurisdiction changed', async(() => {
    mockDefinitionsService.getJurisdictions.and.returnValue(Observable.of([JURISDICTION_2]));
    fixture.detectChanges();
    component.ngOnInit();
    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.filterCaseTypeControl.setValue(CASE_TYPES_2[0].id);
    component.onCaseTypeIdChange();

    fixture.detectChanges();

    let eventSelector = de.query($SELECT_EVENT);
    expect(eventSelector.children.length).toEqual(3);
    let selectEvent0 = eventSelector.children[0];
    expect(selectEvent0.nativeElement.value).toBe('');
    expect(selectEvent0.nativeElement.textContent).toEqual('--Select a value--');
    let selectEvent1 = eventSelector.children[1];
    expect(selectEvent1.nativeElement.value).toBe(EVENT_ID_1);
    expect(selectEvent1.nativeElement.textContent).toEqual(EVENT_NAME_1);
    let selectEvent2 = eventSelector.children[2];
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

  it('should have an Go button disabled when event is not set', async(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = null;
    component.filterEventControl.setValue('');

    component.onEventIdChange();

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    expect(button.nativeElement.disabled).toBeTruthy();
  }));

  it('should have an Go button enabled when event is set', async(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);

    component.onEventIdChange();

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    expect(button.nativeElement.disabled).toBeFalsy();
  }));

  it('should load create case page when form fields selected and Go button clicked', async(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/create/case', JURISDICTION_2.id, CASE_TYPES_2[2].id, EVENT_ID_2],
      { queryParams: {}});

  }));

  it('should notify user about errors/warnings when fields selected and button clicked and response with callback errors/warnings', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();
    const VALID_ERROR = {
      callbackErrors: ['error1', 'error2'],
      callbackWarnings: ['warning1', 'warning2']
    };
    mockRouter.navigate.and.returnValue({ catch : (error) => error(VALID_ERROR)});

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/create/case', JURISDICTION_2.id, CASE_TYPES_2[2].id, EVENT_ID_2],
      { queryParams: {}});
    expect(mockCallbackErrorSubject.next).toHaveBeenCalledWith(VALID_ERROR);
  });

  it('should notify user about field validation errors when response with field validation errors', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();
    const FIELD_ERRORS = [
      {
        message: 'This field1 failed validation'
      },
      {
        message: 'This field2 failed validation'
      }
    ];
    const VALID_ERROR = {
      message: 'Field validation failed',
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    mockRouter.navigate.and.returnValue({ catch : (error) => error(VALID_ERROR)});

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();
    fixture.detectChanges();

    expect(mockRouter.navigate).toHaveBeenCalledWith(
      ['/create/case', JURISDICTION_2.id, CASE_TYPES_2[2].id, EVENT_ID_2],
      { queryParams: {}});
    expect(mockCallbackErrorSubject.next).toHaveBeenCalledWith(VALID_ERROR);

    let errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeTruthy();
    let errorMessage = errorElement.query($ERROR_MESSAGE);
    expect(text(errorMessage)).toBe('Field validation failed');
    let errorFieldMessages = errorElement.query($ERROR_FIELD_MESSAGES);
    expect(errorFieldMessages.children.length).toBe(2);
    expect(errorFieldMessages.children[0].nativeElement.textContent).toContain('This field1 failed validation');
    expect(errorFieldMessages.children[1].nativeElement.textContent).toContain('This field2 failed validation');
  });

  it('should remove field validation errors when errors previously but new jurisdiction selected', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();
    const FIELD_ERRORS = [
      {
        message: 'This field1 failed validation'
      },
      {
        message: 'This field2 failed validation'
      }
    ];
    const VALID_ERROR = {
      message: 'Field validation failed',
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    mockRouter.navigate.and.returnValue({ catch : (error) => error(VALID_ERROR)});

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();
    fixture.detectChanges();

    let errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeTruthy();
    let errorMessage = errorElement.query($ERROR_MESSAGE);
    expect(errorMessage).toBeTruthy();
    let errorFieldMessages = errorElement.query($ERROR_FIELD_MESSAGES);
    expect(errorFieldMessages).toBeTruthy();

    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeFalsy();
  });

  it('should remove field validation errors when errors previously but new case type selected', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[0];
    component.selectedJurisdictionCaseTypes = CASE_TYPES_2;
    component.selectedCaseTypeEvents = CASE_TYPES_2[0].events;
    component.selected.event = CASE_TYPES_2[0].events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();
    const FIELD_ERRORS = [
      {
        message: 'This field1 failed validation'
      },
      {
        message: 'This field2 failed validation'
      }
    ];
    const VALID_ERROR = {
      message: 'Field validation failed',
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    mockRouter.navigate.and.returnValue({ catch : (error) => error(VALID_ERROR)});

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();
    fixture.detectChanges();

    let errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeTruthy();
    let errorMessage = errorElement.query($ERROR_MESSAGE);
    expect(errorMessage).toBeTruthy();
    let errorFieldMessages = errorElement.query($ERROR_FIELD_MESSAGES);
    expect(errorFieldMessages).toBeTruthy();

    component.filterCaseTypeControl.setValue(CASE_TYPES_2[2].id);
    component.onCaseTypeIdChange();
    fixture.detectChanges();

    errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeFalsy();
  });

  it('should remove field validation errors when errors previously but new event selected', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selectedCaseTypeEvents = CASE_TYPE.events;
    component.selected.event = CASE_TYPE.events[1];
    component.filterEventControl.setValue(EVENT_ID_2);
    component.onEventIdChange();
    const FIELD_ERRORS = [
      {
        message: 'This field1 failed validation'
      },
      {
        message: 'This field2 failed validation'
      }
    ];
    const VALID_ERROR = {
      message: 'Field validation failed',
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    mockRouter.navigate.and.returnValue({ catch : (error) => error(VALID_ERROR)});

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    button.nativeElement.click();
    fixture.detectChanges();

    let errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeTruthy();
    let errorMessage = errorElement.query($ERROR_MESSAGE);
    expect(errorMessage).toBeTruthy();
    let errorFieldMessages = errorElement.query($ERROR_FIELD_MESSAGES);
    expect(errorFieldMessages).toBeTruthy();

    component.filterEventControl.setValue(EVENT_ID_3);
    component.onEventIdChange();
    fixture.detectChanges();

    errorElement = de.query($ERROR_SUMMARY);
    expect(errorElement).toBeFalsy();
  });

  it('should change button label when callback warnings notified', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CreateCaseFiltersComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);

    fixture.detectChanges();
    let button = de.query($SELECT_BUTTON);
    expect(button.nativeElement.textContent).toEqual(CreateCaseFiltersComponent.TRIGGER_TEXT_START);

    callbackErrorsContext.trigger_text = CreateCaseFiltersComponent.TRIGGER_TEXT_CONTINUE;
    component.callbackErrorsNotify(callbackErrorsContext);

    fixture.detectChanges();
    expect(button.nativeElement.textContent).toEqual(CreateCaseFiltersComponent.TRIGGER_TEXT_CONTINUE);
  });

  it('should clear errors and warnings', () => {
    let callbackErrorsContext: CallbackErrorsContext = new CallbackErrorsContext();
    callbackErrorsContext.trigger_text = CaseViewerComponent.TRIGGER_TEXT_START;
    component.callbackErrorsNotify(callbackErrorsContext);

    fixture.detectChanges();
    component.resetErrors();

    let error = de.query($ERROR_SUMMARY);
    expect(error).toBeFalsy();
    expect(component.error).toBeFalsy();
    expect(component.ignoreWarning).toBeFalsy();
  });

  it('should disable button when form valid but callback validation errors exists', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selected.event = CASE_TYPE.events[1];
    component.error = HttpError.from({});
    fixture.detectChanges();

    let button = de.query($SUBMIT_BUTTON);
    expect(attr(button, 'disabled')).toEqual(null);
    const FIELD_ERRORS = [
      {
        x: ''
      }
    ];
    const VALID_ERROR = {
      details: {
        field_errors: FIELD_ERRORS
      }
    };
    let error = HttpError.from(VALID_ERROR);
    component.error = error;
    fixture.detectChanges();

    expect(attr(button, 'disabled')).toEqual('');
  });

  it('should disable button when form valid but callback errors exist', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selected.event = CASE_TYPE.events[1];
    fixture.detectChanges();

    let button = de.query($SUBMIT_BUTTON);

    expect(attr(button, 'disabled')).toEqual(null);
    let error = HttpError.from({});
    error.callbackErrors = ['anErrors'];
    component.error = error;
    fixture.detectChanges();

    expect(attr(button, 'disabled')).toEqual('');
  });

  it('should enable button when previously disabled for callback errors but new jurisdiction, case type and event selected', () => {
    let error = HttpError.from({});
    error.callbackErrors = ['anErrors'];
    component.error = error;
    fixture.detectChanges();
    let button = de.query($SUBMIT_BUTTON);
    expect(attr(button, 'disabled')).toEqual('');

    component.filterJurisdictionControl.setValue(JURISDICTION_2.id);
    component.onJurisdictionIdChange();
    component.selected.caseType = CASE_TYPES_2[2];
    component.selected.event = CASE_TYPE.events[1];
    component.error = null;
    fixture.detectChanges();
    expect(attr(button, 'disabled')).toEqual(null);
    expect(mockCallbackErrorSubject.next).toHaveBeenCalledWith(null);
    expect(mockAlertService.clear).toHaveBeenCalled();
  });
});
