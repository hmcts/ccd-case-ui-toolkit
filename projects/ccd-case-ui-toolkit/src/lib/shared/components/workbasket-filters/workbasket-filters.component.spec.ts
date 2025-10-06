import { Component, CUSTOM_ELEMENTS_SCHEMA, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { ConditionalShowModule } from '../../directives';
import { CaseType } from '../../domain/definition/case-type.model';
import { FieldTypeEnum } from '../../domain/definition/field-type-enum.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { WorkbasketInputModel } from '../../domain/workbasket/workbasket-input.model';
import { AlertService } from '../../services/alert/alert.service';
import { HttpService } from '../../services/http/http.service';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { WindowService } from '../../services/window/window.service';
import { WorkbasketInputFilterService } from '../../services/workbasket/workbasket-input-filter.service';
import { MockRpxTranslatePipe } from '../../test/mock-rpx-translate.pipe';
import { AbstractFieldWriteComponent } from '../palette/base-field/abstract-field-write.component';
import { WorkbasketFiltersComponent } from './workbasket-filters.component';

import createSpyObj = jasmine.createSpyObj;

@Component({
    selector: 'ccd-field-write',
    template: `{{value}}`,
    standalone: false
})
class FieldWriteComponent extends AbstractFieldWriteComponent {
}

const JURISDICTION_1: Jurisdiction = {
  id: 'J1',
  name: 'Jurisdiction 1',
  description: '',
  caseTypes: []
};

const CASE_TYPES_1: CaseType[] = [
  {
    id: 'CT0',
    name: 'Case type 0',
    description: '',
    states: [
      {
        id: 'S01',
        name: 'State 01',
        description: ''
      },
      {
        id: 'S02',
        name: 'State 02',
        description: ''
      }
    ],
    events: [],
    case_fields: [],
    jurisdiction: null
  }
];

const JURISDICTION_2: Jurisdiction = {
  id: 'J2',
  name: 'Jurisdiction 2',
  description: '',
  caseTypes: []
};

const CASE_TYPES_2: CaseType[] = [
  {
    id: 'CT1',
    name: 'Case type 1',
    description: '',
    states: [],
    events: [],
    case_fields: [],
    jurisdiction: null
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
    case_fields: [],
    jurisdiction: null
  },
  {
    id: 'CT3',
    name: 'Case type 3',
    description: '',
    states: [],
    events: [],
    case_fields: [],
    jurisdiction: null
  }
];

const JURISDICTION_3: Jurisdiction = {
  id: 'J3',
  name: 'Jurisdiction 3',
  description: 'Jurisdiction 3 with case types',
  caseTypes: CASE_TYPES_1
};

const DEFAULT_CASE_TYPE = CASE_TYPES_2[1];
const DEFAULT_CASE_STATE = DEFAULT_CASE_TYPE.states[1];

const CRUD_FILTERED_CASE_TYPES: CaseType[] = [
  {
    id: 'CT1',
    name: 'Case type 1',
    description: '',
    states: [{
      id: 'S1',
      name: 'State 1',
      description: ''
    }],
    events: [],
    case_fields: [],
    jurisdiction: null
  },
  {
    id: 'CT3',
    name: 'Case type 3',
    description: '',
    states: [{
      id: 'S1',
      name: 'State 1',
      description: ''
    }],
    events: [],
    case_fields: [],
    jurisdiction: null
  }
];
const EMPTY_CASE_TYPES: CaseType[] = [];
const CASE_TYPE_WITH_EMPTY_STATES: CaseType[] = [{
  id: 'CT3',
  name: 'Case type 3',
  description: '',
  states: [],
  events: [],
  case_fields: [],
  jurisdiction: null
}];

const createWorkbasketInputs = () => {
  return [
    createWBInput('Label 1', 1, 'PersonFirstName', 'Text', 'Text', '', 'Mohammed', false),
    createWBInput('Label 2', 2, 'PersonLastName', 'Text', 'Text', '', 'Khatri', true),
    createWBInput('Label 3', 3, 'PersonAddress', 'Text', 'Text', 'Country', '', false)
  ];
};

const TEST_WORKBASKET_INPUTS: WorkbasketInputModel[] = createWorkbasketInputs();

const METADATA_FIELDS = ['PersonLastName'];

const $APPLY_BUTTON = By.css('button');

let fixture: ComponentFixture<WorkbasketFiltersComponent>;
let component: WorkbasketFiltersComponent;
let de: DebugElement;

let workbasketHandler;
let router: any;
let activatedRoute: any;
let httpService: HttpService;
let jurisdictionService: JurisdictionService;
let workbasketInputFilterService: any;
let orderService: any;
let alertService: AlertService;
let windowService;
const TEST_FORM_GROUP = new FormGroup({});

describe('Clear localStorage for workbasket filters', () => {
  let windowMockService: WindowService;
  beforeEach(waitForAsync(() => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    httpService = createSpyObj<HttpService>('httpService', ['get', 'post']);
    jurisdictionService = new JurisdictionService(httpService);
    windowMockService = createSpyObj<WindowService>('windowService', ['clearLocalStorage', 'locationAssign',
      'getLocalStorage', 'removeLocalStorage', 'setLocalStorage']);
    resetCaseTypes(JURISDICTION_2, CASE_TYPES_2);
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowMockService },
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(WorkbasketFiltersComponent);
        component = fixture.componentInstance;

        component.jurisdictions = [
          JURISDICTION_1,
          JURISDICTION_2
        ];
        component.formGroup = TEST_FORM_GROUP;
        component.defaults = {
          jurisdiction_id: JURISDICTION_2.id,
          case_type_id: DEFAULT_CASE_TYPE.id,
          state_id: DEFAULT_CASE_STATE.id
        };
        component.onApply.subscribe(workbasketHandler.applyFilters);

        de = fixture.debugElement;
        fixture.detectChanges();
      });
  }));

  it('should be setup', () => {
    expect(fixture).toBeTruthy();
  });
});

describe('with defaults', () => {
  beforeEach(waitForAsync(() => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    jurisdictionService = new JurisdictionService(httpService);
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
    windowService.getLocalStorage.and.returnValue('{}');
    resetCaseTypes(JURISDICTION_2, CASE_TYPES_2);
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService },
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();

    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_2.id,
      case_type_id: DEFAULT_CASE_TYPE.id,
      state_id: DEFAULT_CASE_STATE.id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should disable the button', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = null;
    component.selected.caseState = null;

    fixture.detectChanges();
    const button = de.query($APPLY_BUTTON);
    expect(button.nativeElement.disabled).toBeTruthy();
  });

  it('should have an Apply button disabled when case type is not set', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = null;
    component.selected.caseState = null;
    fixture.detectChanges();

    const button = de.query($APPLY_BUTTON);
    expect(button.nativeElement.disabled).toBeTruthy();
  });

  it('should initialise jurisdiction selector with given jurisdictions', () => {
    const selector = de.query(By.css('#wb-jurisdiction'));

    expect(selector.children.length).toEqual(2);

    const juris1 = selector.children[0];
    expect(juris1.nativeElement.textContent).toEqual(JURISDICTION_1.name);

    const juris2 = selector.children[1];
    expect(juris2.nativeElement.textContent).toEqual(JURISDICTION_2.name);
  });

  it('should initially select jurisdiction based on defaults', () => {
    const selector = de.query(By.css('#wb-jurisdiction'));

    expect(selector.nativeElement.selectedIndex).toEqual(1);
    expect(component.selected.jurisdiction).toBe(JURISDICTION_2);
  });

  it('should update selected jurisdiction', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_1;
    fixture.detectChanges();

    fixture
      .whenStable()
      .then(() => {
        const selector = de.query(By.css('#wb-jurisdiction'));
        expect(selector.nativeElement.selectedIndex).toEqual(0);
        expect(component.selected.jurisdiction).toBe(JURISDICTION_1);
      });
  }));

  it('should initialise case type selector with types from selected jurisdiction', () => {
    const selector = de.query(By.css('#wb-case-type'));

    expect(selector.children.length).toEqual(3);

    const ct1 = selector.children[0];
    expect(ct1.nativeElement.textContent).toEqual(CASE_TYPES_2[0].name);

    const ct2 = selector.children[1];
    expect(ct2.nativeElement.textContent).toEqual(DEFAULT_CASE_TYPE.name);

    const ct3 = selector.children[2];
    expect(ct3.nativeElement.textContent).toEqual(CASE_TYPES_2[2].name);
  });

  it('should initially select case type based on default', () => {
    const selector = de.query(By.css('#wb-case-type'));

    expect(selector.nativeElement.selectedIndex).toEqual(1);
    expect(component.selected.caseType).toBe(DEFAULT_CASE_TYPE);
  });

  it('should update selected case type', waitForAsync(() => {
    component.selected.caseType = CASE_TYPES_2[2];
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const selector = de.query(By.css('#wb-case-type'));
      expect(selector.nativeElement.selectedIndex).toEqual(2);
      expect(component.selected.caseType).toBe(CASE_TYPES_2[2]);
    });
  }));

  it('should initialise case state selector with states from selected case type', () => {
    const selector = de.query(By.css('#wb-case-state'));

    expect(selector.children.length).toEqual(3);

    const cs1 = selector.children[0];
    expect(cs1.nativeElement.textContent).toEqual('Any');

    const cs2 = selector.children[1];
    expect(cs2.nativeElement.textContent).toEqual(DEFAULT_CASE_TYPE.states[0].name);

    const cs3 = selector.children[2];
    expect(cs3.nativeElement.textContent).toEqual(DEFAULT_CASE_STATE.name);
    expect(orderService.sortAsc).toHaveBeenCalled();
  });

  it('should initially select case state based on default', () => {
    const selector = de.query(By.css('#wb-case-state'));

    expect(selector.nativeElement.selectedIndex).toEqual(2);
    expect(component.selected.caseState).toBe(DEFAULT_CASE_TYPE.states[1]);
    expect(orderService.sortAsc).toHaveBeenCalled();
  });

  it('should update selected case state', waitForAsync(() => {
    component.selected.caseState = DEFAULT_CASE_TYPE.states[0];
    fixture.detectChanges();

    fixture
      .whenStable()
      .then(() => {
        const selector = de.query(By.css('#wb-case-state'));
        expect(selector.nativeElement.selectedIndex).toEqual(1);
        expect(component.selected.caseState).toBe(DEFAULT_CASE_TYPE.states[0]);
      });
  }));

  it('should submit filters when defaults could be selected, preserving the alerts', () => {
    expect(workbasketHandler.applyFilters).toHaveBeenCalledWith({
      selected: {
        jurisdiction: JURISDICTION_2,
        caseType: DEFAULT_CASE_TYPE,
        caseState: DEFAULT_CASE_STATE,
        init: false,
        page: 1,
        formGroup: null,
        metadataFields: METADATA_FIELDS
      },
      queryParams: { jurisdiction: JURISDICTION_2.id, 'case-type': DEFAULT_CASE_TYPE.id, 'case-state': DEFAULT_CASE_STATE.id }
    });

    expect(workbasketHandler.applyFilters).toHaveBeenCalledTimes(1);

    expect(alertService.setPreserveAlerts).toHaveBeenCalledWith(true);
  });

  it('should submit filters when apply button is clicked, not preserving the alerts', waitForAsync(() => {
    workbasketHandler.applyFilters.calls.reset();

    const button = de.query(By.css('.workbasket-filters-apply'));
    button.nativeElement.click();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      expect(workbasketHandler.applyFilters).toHaveBeenCalledWith({
        selected: {
          jurisdiction: JURISDICTION_2,
          caseType: DEFAULT_CASE_TYPE,
          caseState: DEFAULT_CASE_STATE,
          init: true,
          page: 1,
          formGroup: null,
          metadataFields: METADATA_FIELDS
        },
        queryParams: { jurisdiction: JURISDICTION_2.id, 'case-type': DEFAULT_CASE_TYPE.id, 'case-state': DEFAULT_CASE_STATE.id }
      });
      expect(workbasketHandler.applyFilters).toHaveBeenCalledTimes(1);
      expect(alertService.setPreserveAlerts).toHaveBeenCalledWith(false);
    });
  }));

  it('should reset searchFilters when Jurisdiction changes even when Apply button is disabled', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = null;
    component.selected.caseState = null;

    const formValue = {};
    windowService.getLocalStorage.and.returnValue(formValue);
    const button = de.query($APPLY_BUTTON);

    fixture.detectChanges();
    expect(button.nativeElement.disabled).toBeTruthy();

    component.selected.jurisdiction = JURISDICTION_1;
    fixture.detectChanges();

    component.onJurisdictionIdChange();

    fixture.detectChanges();
    expect(component.workbasketInputsReady).toBeFalsy();
  });

  it('should have form group details added when apply button is clicked', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.apply(true);

    fixture.detectChanges();

    expect(workbasketHandler.applyFilters).toHaveBeenCalledWith({
      selected: component.selected,
      queryParams: { jurisdiction: JURISDICTION_2.id, 'case-type': DEFAULT_CASE_TYPE.id, 'case-state': DEFAULT_CASE_STATE.id }
    });
    expect(component.selected.formGroup).toEqual(null);
  });

  it('should have metadata fields added when apply button is clicked', () => {
    component.workbasketInputs = TEST_WORKBASKET_INPUTS;

    component.apply(true);

    expect(component.selected.metadataFields).toEqual(METADATA_FIELDS);
  });

  it('should update search input when case type is reset', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[1];
    component.selected.caseState = CASE_TYPES_2[1].states[0];
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(of([]));

    component.onCaseTypeIdChange();
    expect(workbasketInputFilterService.getWorkbasketInputs).toHaveBeenCalledWith(JURISDICTION_2.id, CASE_TYPES_2[1].id);
  });

  it('should ignore error and reset input fields', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[1];
    component.selected.caseState = CASE_TYPES_2[1].states[0];
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(throwError(new Error('Response expired')));

    component.onCaseTypeIdChange();
    expect(component.workbasketInputsReady).toBeFalsy();
    expect(component.workbasketInputs.length).toBe(0);
  });

  it('should order search inputs', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.onCaseTypeIdChange();
    expect(orderService.sortAsc).toHaveBeenCalled();
  });

  it('should render an input for each defined search input', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[1];
    component.selected.caseState = CASE_TYPES_2[1].states[0];

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const dynamicFilters = de.query(By.css('#dynamicFilters'));

    expect(dynamicFilters.children.length).toBe(TEST_WORKBASKET_INPUTS.length);
  });

  it('should render a valid search input field component', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[1];
    component.selected.caseState = CASE_TYPES_2[1].states[0];

    const expectedInput = TEST_WORKBASKET_INPUTS[0];
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(of([expectedInput]));

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const dynamicFilters = de.query(By.css('#dynamicFilters'));

    const writeField = dynamicFilters.query(By.directive(FieldWriteComponent));

    const writeFieldInstance = writeField.componentInstance;

    expect(writeFieldInstance.caseField.id).toEqual(expectedInput.field.id);
    expect(writeFieldInstance.caseField.label).toEqual(expectedInput.field.label);
    expect(writeFieldInstance.formGroup).toBeTruthy();
  });

  it('should render a valid search input field component when path is defined', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[1];
    component.selected.caseState = CASE_TYPES_2[1].states[0];

    const complexFieldSearchInput = TEST_WORKBASKET_INPUTS[2];
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(of([complexFieldSearchInput]));

    const expectedFieldId = complexFieldSearchInput.field.id;
    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const dynamicFilters = de.query(By.css('#dynamicFilters'));
    const writeField = dynamicFilters.query(By.directive(FieldWriteComponent));
    const writeFieldInstance = writeField.componentInstance;

    expect(writeFieldInstance.caseField.id).toEqual(expectedFieldId);
    expect(writeFieldInstance.formGroup).toBeTruthy();
  });

  it('should submit filters when apply button is clicked', () => {
    const control = new FormControl('test');
    control.setValue('anything');
    const formControls = {
      name: control
    };
    const formGroup = new FormGroup(formControls);
    component.formGroup = formGroup;
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selected.caseState = DEFAULT_CASE_STATE;

    workbasketHandler.applyFilters.calls.reset();

    const button = de.query(By.css('button'));
    button.nativeElement.click();

    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const arg: any = workbasketHandler.applyFilters.calls.mostRecent().args[0].selected;
      expect(workbasketHandler.applyFilters).toHaveBeenCalledWith({
        selected: component.selected,
        queryParams: { jurisdiction: JURISDICTION_2.id, 'case-type': CASE_TYPES_2[2].id, 'case-state': DEFAULT_CASE_STATE.id }
      });
      expect(arg['jurisdiction']).toEqual(JURISDICTION_2);
      expect(arg['caseType']).toEqual(CASE_TYPES_2[2]);
      expect(arg['formGroup'].value).toEqual(formGroup.value);
      expect(workbasketHandler.applyFilters).toHaveBeenCalledTimes(1);
    });
  });

  it('should remove any "_judicialUserControl"-suffixed FormControl values from the FormGroup value to be stored locally', () => {
    const control = new FormControl('test');
    const judicialUserControl = new FormControl('judicialUser1');
    const formControls = {
      name: control,
      j1_judicialUserControl: judicialUserControl
    };
    const formGroup = new FormGroup(formControls);
    component.formGroup = formGroup;
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    component.selected.caseState = DEFAULT_CASE_STATE;

    workbasketHandler.applyFilters.calls.reset();

    const button = de.query(By.css('button'));
    button.nativeElement.click();

    fixture.detectChanges();
    // The "j1_judicialUserControl" property is expected to have been removed, leaving just the "name" property
    // Need to check the second call to windowService.setLocalStorage(); the first one is for "savedQueryParams"
    expect(windowService.setLocalStorage.calls.argsFor(1)).toEqual(
      ['workbasket-filter-form-group-value', JSON.stringify({ name: 'test' })]);
  });

  it('should update form group filters', () => {
    const formGroupLocalStorage = {
      regionList: 'london',
      londonFRCList: 'london',
      londonCourtList: 'FR_londonList_10',
      southEastFRCList: null,
      thamesvalleyCourtList: null
    };
    windowService.getLocalStorage.and.returnValue(JSON.stringify(formGroupLocalStorage));

    const formControls = {
      regionList: new FormControl('southeast'),
      londonFRCList: new FormControl('london'),
      londonCourtList: new FormControl('FR_londonList_10'),
      southEastFRCList: new FormControl('thamesvalley'),
      thamesvalleyCourtList: new FormControl('FR_thamesvalleyList_2')
    };
    component.formGroup = new FormGroup(formControls);

    component.updateFormGroupFilters();
    expect(component.formGroup.get('londonFRCList').value).toBe(null);
    expect(component.formGroup.get('londonCourtList').value).toBe(null);
  });

  it('should announce the selected jurisdiction and case type via the JurisdictionService when filters are applied', () => {
    spyOn(jurisdictionService, 'announceSelectedJurisdiction');
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[0];
    component.apply(false);
    expect(component.selected.jurisdiction.currentCaseType).toEqual(CASE_TYPES_2[0]);
    expect(jurisdictionService.announceSelectedJurisdiction).toHaveBeenCalledWith(component.selected.jurisdiction);
  });
});

describe('with defaults and CRUD', () => {
  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    resetCaseTypes(JURISDICTION_2, CRUD_FILTERED_CASE_TYPES);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
    jurisdictionService = new JurisdictionService(httpService);
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;
    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_2.id,
      case_type_id: CASE_TYPES_2[1].id,
      state_id: CASE_TYPES_2[1].states[1].id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should populate case types drop down with CRUD filtered case types and sort states', waitForAsync(() => {
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    fixture
      .whenStable()
      .then(() => {
        const selector = de.query(By.css('#wb-case-type'));
        expect(selector.children.length).toEqual(2);

        const juris1 = selector.children[0];
        expect(juris1.nativeElement.textContent).toEqual(CRUD_FILTERED_CASE_TYPES[0].name);

        const juris2 = selector.children[1];
        expect(juris2.nativeElement.textContent).toEqual(CRUD_FILTERED_CASE_TYPES[1].name);

        expect(orderService.sortAsc).toHaveBeenCalled();
      });
  }));

  it('should select first case type from a case types drop down if default is filtered out due to CRUD', () => {
    component.selected.caseType = CRUD_FILTERED_CASE_TYPES[0];
    const selector = de.query(By.css('#wb-case-type'));
    expect(selector.nativeElement.selectedIndex).toEqual(0);
    expect(component.selected.caseType).toBe(CRUD_FILTERED_CASE_TYPES[0]);
  });

  it('should select first state from a states drop down if default is filtered out due to CRUD', () => {
    component.selected.caseType = CRUD_FILTERED_CASE_TYPES[0];
    const selector = de.query(By.css('#wb-case-state'));
    component.defaults.state_id = CRUD_FILTERED_CASE_TYPES[0].states[0].id;
    expect(selector.nativeElement.selectedIndex).toEqual(0);
    expect(component.selected.caseState).toEqual(null);
  });
});

describe('with defaults and CRUD and empty case types', () => {
  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    resetCaseTypes(JURISDICTION_2, EMPTY_CASE_TYPES);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);

    jurisdictionService = new JurisdictionService(httpService);
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_2.id,
      case_type_id: CRUD_FILTERED_CASE_TYPES[0].id,
      state_id: CRUD_FILTERED_CASE_TYPES[0].states[0].id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should disable case type dropdown if default is filtered out due to CRUD and no other case types', () => {
    const caseTypeSelector = de.query(By.css('#wb-case-type'));
    expect(caseTypeSelector.nativeElement.disabled).toBeTruthy();

    const stateSelector = de.query(By.css('#wb-case-state'));
    expect(stateSelector.nativeElement.disabled).toBeTruthy();

    expect(orderService.sortAsc).not.toHaveBeenCalled();
  });
});

describe('with defaults and CRUD and type with empty case states', () => {
  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    resetCaseTypes(JURISDICTION_2, CASE_TYPE_WITH_EMPTY_STATES);
    orderService = createSpyObj('orderService', ['sortAsc']);
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    jurisdictionService = new JurisdictionService(httpService);
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_2.id,
      case_type_id: CRUD_FILTERED_CASE_TYPES[1].id,
      state_id: CRUD_FILTERED_CASE_TYPES[0].states[0].id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should disable states dropdown if default is filtered out due to CRUD and no other states', () => {
    const caseTypeSelector = de.query(By.css('#wb-case-type'));
    expect(caseTypeSelector.nativeElement.disabled).toBeFalsy();
    expect(caseTypeSelector.nativeElement.selectedIndex).toEqual(0);
    expect(component.selected.caseType).toBe(CASE_TYPE_WITH_EMPTY_STATES[0]);

    const stateSelector = de.query(By.css('#wb-case-state'));
    expect(stateSelector.nativeElement.disabled).toBeTruthy();
    expect(orderService.sortAsc).toHaveBeenCalled();
  });
});

describe('with query parameters', () => {

  const QUERY_PARAMS = {
    [WorkbasketFiltersComponent.PARAM_JURISDICTION]: 'J1',
    [WorkbasketFiltersComponent.PARAM_CASE_TYPE]: 'CT0',
    [WorkbasketFiltersComponent.PARAM_CASE_STATE]: 'S02'
  };

  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    resetCaseTypes(JURISDICTION_1, CASE_TYPES_1);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    activatedRoute = {
      queryParams: of(QUERY_PARAMS),
      snapshot: {
        queryParams: QUERY_PARAMS
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_2.id,
      case_type_id: DEFAULT_CASE_TYPE.id,
      state_id: DEFAULT_CASE_STATE.id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should initially select jurisdiction based on query parameter', () => {
    expect(component.selected.jurisdiction).toBe(JURISDICTION_1);
  });

  it('should initially select case type based on query parameter', () => {
    expect(component.selected.caseType).toEqual(CASE_TYPES_1[0]);
  });

  it('should initially select case state based on query parameter', () => {
    expect(component.selected.caseState).toBe(CASE_TYPES_1[0].states[1]);
  });

});

describe('with invalid query parameters: jurisdiction and empty case types', () => {

  const QUERY_PARAMS = {
    [WorkbasketFiltersComponent.PARAM_JURISDICTION]: 'FALSE',
    [WorkbasketFiltersComponent.PARAM_CASE_TYPE]: 'CT0',
    [WorkbasketFiltersComponent.PARAM_CASE_STATE]: 'S02'
  };

  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    resetCaseTypes(JURISDICTION_2, EMPTY_CASE_TYPES);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);
    windowService.getLocalStorage.and.returnValue(JSON.stringify(QUERY_PARAMS));
    activatedRoute = {
      queryParams: of(QUERY_PARAMS),
      snapshot: {
        queryParams: QUERY_PARAMS
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2,
      JURISDICTION_3
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {
      jurisdiction_id: JURISDICTION_3.id,
      case_type_id: CASE_TYPES_1[0].id,
      state_id: DEFAULT_CASE_STATE.id
    };
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should select default values after ngOnInit', fakeAsync(() => {
    component.ngOnInit();
    tick(); // Simulate the passage of time to trigger subscriptions
    expect(component.selected.jurisdiction).toEqual(JURISDICTION_3);
    expect(component.selected.caseType).toEqual(CASE_TYPES_1[0]);
    expect(component.selected.caseState).toBeUndefined();
  }));
});

describe('with no defaults', () => {
  const SELECT_A_VALUE = 'Select a value';
  const ANY = 'Any';
  const JURISDICTION_ONE: Jurisdiction = {
    id: 'J1',
    name: 'Jurisdiction 1',
    description: '',
    caseTypes: CASE_TYPES_1
  };

  beforeEach(async () => {
    workbasketHandler = createSpyObj('workbasketHandler', ['applyFilters']);
    router = createSpyObj<Router>('router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve('someResult'));
    alertService = createSpyObj<AlertService>('alertService', ['isPreserveAlerts', 'setPreserveAlerts']);
    orderService = createSpyObj('orderService', ['sortAsc']);
    workbasketInputFilterService = createSpyObj<WorkbasketInputFilterService>('workbasketInputFilterService', ['getWorkbasketInputs']);
    workbasketInputFilterService.getWorkbasketInputs.and.returnValue(createObservableFrom(TEST_WORKBASKET_INPUTS));
    jurisdictionService = new JurisdictionService(httpService);
    windowService = createSpyObj<WindowService>('windowService', ['clearLocalStorage', 'locationAssign',
      'getLocalStorage', 'setLocalStorage', 'removeLocalStorage']);
    windowService.getLocalStorage.and.returnValue('{}');
    activatedRoute = {
      queryParams: of({}),
      snapshot: {
        queryParams: {}
      }
    };

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          WorkbasketFiltersComponent,
          FieldWriteComponent,
          MockRpxTranslatePipe
        ],
        providers: [
          { provide: Router, useValue: router },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: OrderService, useValue: orderService },
          { provide: WorkbasketInputFilterService, useValue: workbasketInputFilterService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: AlertService, useValue: alertService },
          { provide: WindowService, useValue: windowService }
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
      })
      .compileComponents();
    fixture = TestBed.createComponent(WorkbasketFiltersComponent);
    component = fixture.componentInstance;

    component.jurisdictions = [
      JURISDICTION_ONE
    ];
    component.formGroup = TEST_FORM_GROUP;
    component.defaults = {};
    component.onApply.subscribe(workbasketHandler.applyFilters);

    de = fixture.debugElement;
    fixture.detectChanges();
  });

  afterAll(() => {
    TestBed.resetTestingModule();
  });

  it('should have disabled button', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = null;
    component.selected.caseState = null;

    fixture.detectChanges();
    const button = de.query($APPLY_BUTTON);
    expect(button.nativeElement.disabled).toBeTruthy();
  });

  it('should initialise jurisdiction selector with "Select a value"', () => {
    const selector = de.query(By.css('#wb-jurisdiction'));

    expect(selector.children.length).toEqual(2);

    expect(selector.children[0].nativeElement.textContent).toEqual(SELECT_A_VALUE);

    expect(selector.nativeElement.selectedIndex).toEqual(0);

  });

  it('should initialise case type with types from selected jurisdiction and index should be "Select a value" ', async () => {
    component.selected.jurisdiction = JURISDICTION_ONE;
    fixture.detectChanges();

    component.onJurisdictionIdChange();
    fixture.detectChanges();

    await fixture
      .whenStable()
      .then(() => {
        let selector = de.query(By.css('#wb-jurisdiction'));
        expect(selector.nativeElement.selectedIndex).toEqual(1);
        expect(component.selected.jurisdiction).toBe(JURISDICTION_ONE);

        selector = de.query(By.css('#wb-case-type'));

        expect(selector.children.length).toEqual(2);
        expect(selector.children[0].nativeElement.textContent).toEqual(SELECT_A_VALUE);
        expect(selector.nativeElement.selectedIndex).toEqual(0);
      });
  });

  it('should initialise case state with states from selected case type and index should be first state ', async () => {
    component.selected.jurisdiction = JURISDICTION_ONE;
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    component.selected.caseType = CASE_TYPES_1[0];
    fixture.detectChanges();

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    await fixture
      .whenStable()
      .then(() => {
        let selector = de.query(By.css('#wb-case-type'));
        expect(selector.nativeElement.selectedIndex).toEqual(1);
        expect(component.selected.caseType).toBe(CASE_TYPES_1[0]);

        selector = de.query(By.css('#wb-case-state'));

        expect(selector.children.length).toEqual(3);
        expect(selector.nativeElement.selectedIndex).toEqual(0);
      });
  });

  it('should remove localStorage and clear selected fields once reset button is clicked', fakeAsync(() => {
    // Set some initial values for the jurisdiction, case type and case state
    component.selected.jurisdiction = JURISDICTION_ONE;
    component.onJurisdictionIdChange();
    component.selected.caseType = CASE_TYPES_1[0];
    component.onCaseTypeIdChange();
    component.selected.caseState = CASE_TYPES_1[0].states[0];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    let selector = de.query(By.css('#wb-jurisdiction'));
    expect(selector.nativeElement.selectedIndex).toEqual(1);
    selector = de.query(By.css('#wb-case-type'));
    expect(selector.nativeElement.selectedIndex).toEqual(1);
    selector = de.query(By.css('#wb-case-state'));
    expect(selector.nativeElement.selectedIndex).toEqual(1);

    spyOn(component, 'apply').and.callThrough();
    component.reset();
    // Use same time interval as the component does for setTimeout() in the reset() function
    tick(500);
    fixture.detectChanges();

    selector = de.query(By.css('#wb-jurisdiction'));
    // Jurisdiction selection is left unchanged
    expect(selector.nativeElement.selectedIndex).toEqual(1);
    expect(selector.children[0].nativeElement.textContent).toEqual(SELECT_A_VALUE);
    expect(selector.children[1].nativeElement.textContent).toEqual(JURISDICTION_ONE.name);
    selector = de.query(By.css('#wb-case-type'));
    expect(selector.children[0].nativeElement.textContent).toEqual(SELECT_A_VALUE);
    expect(selector.nativeElement.selectedIndex).toEqual(0);
    selector = de.query(By.css('#wb-case-state'));
    expect(selector.children[0].nativeElement.textContent).toEqual(ANY);
    expect(selector.nativeElement.selectedIndex).toEqual(0);

    expect(windowService.removeLocalStorage).toHaveBeenCalledWith('workbasket-filter-form-group-value');
    expect(windowService.removeLocalStorage).toHaveBeenCalledWith('savedQueryParams');
    expect(component.apply).toHaveBeenCalledWith(true);
    expect(windowService.setLocalStorage).toHaveBeenCalledWith('savedQueryParams', jasmine.any(String));
  }));

  it('should call scrollTo when scrollToTop is called', () => {
    // Mock the current scroll position as 100
    Object.defineProperty(document.documentElement, 'scrollTop', { value: 100, writable: true });
    const scrollToSpy = spyOn(window, 'scrollTo');
    component.scrollToTop();
    expect(scrollToSpy).toHaveBeenCalled();
  });
});

function resetCaseTypes(jurisdiction: Jurisdiction, caseTypes: CaseType[]) {
  jurisdiction.caseTypes.splice(0, jurisdiction.caseTypes.length);
  caseTypes.forEach(caseType => jurisdiction.caseTypes.push(caseType));
}

function createObservableFrom<T>(param: T): Observable<T> {
  return Observable.create(observer => {
    observer.next(param);
    observer.complete();
  });
}

function createWBInput(theLabel: string, theOrder: number, theId: string, fieldTypeId: string,
  theType: FieldTypeEnum, elementPath: string, theValue: string, theMetadata: boolean): WorkbasketInputModel {
  return {
    label: theLabel,
    order: theOrder,
    field: {
      id: theId,
      field_type: {
        id: fieldTypeId,
        type: theType
      },
      elementPath,
      value: theValue,
      metadata: theMetadata
    }
  };
}
