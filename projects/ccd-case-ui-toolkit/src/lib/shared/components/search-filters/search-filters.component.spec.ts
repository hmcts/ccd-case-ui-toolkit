import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { Observable, of, throwError } from 'rxjs';
import { ConditionalShowModule } from '../../directives/conditional-show/conditional-show.module';
import { CaseType } from '../../domain/definition/case-type.model';
import { Jurisdiction } from '../../domain/definition/jurisdiction.model';
import { JurisdictionService } from '../../services/jurisdiction/jurisdiction.service';
import { OrderService } from '../../services/order/order.service';
import { SearchService } from '../../services/search/search.service';
import { WindowService } from '../../services/window/window.service';
import { AbstractFieldWriteComponent } from '../palette/base-field/abstract-field-write.component';
import { SearchInput } from './domain/search-input.model';
import { createSearchInputs } from './domain/search-input.test.fixture';
import { SearchFiltersComponent } from './search-filters.component';
import createSpyObj = jasmine.createSpyObj;

const JURISDICTION_1: Jurisdiction = {
  id: 'J1',
  name: 'Jurisdiction 1',
  description: '',
  caseTypes: []
};
const CASE_TYPE_1: CaseType = {
  id: 'CT0',
  name: 'Case type 0',
  description: '',
  states: [],
  events: [],
  case_fields: [],
  jurisdiction: null
};

const CASE_TYPE_2: CaseType = {
  id: 'CT2',
  name: 'Case type 2',
  description: '',
  states: [],
  events: [],
  case_fields: [],
  jurisdiction: null
};

const JURISDICTION_2: Jurisdiction = {
  id: 'J2',
  name: 'Jurisdiction 2',
  description: '',
  caseTypes: []
};

const JURISDICTION_3: Jurisdiction = {
  id: 'J3',
  name: 'Jurisdiction 3',
  description: '',
  caseTypes: [CASE_TYPE_1]
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
  },
  CASE_TYPE_2
];

const CRUD_FILTERED_CASE_TYPES: CaseType[] = [
  {
    id: 'CT1',
    name: 'Case type 1',
    description: '',
    states: [],
    events: [],
    case_fields: [],
    jurisdiction: null
  },
  CASE_TYPE_2,
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

const TEST_SEARCH_INPUTS: SearchInput[] = createSearchInputs();

@Component({
  selector: 'ccd-field-write',
  template: `{{value}}`

})
class FieldWriteComponent extends AbstractFieldWriteComponent {
  @Input()
  public formGroup: FormGroup;
}

function createObservableFrom<T>(param: T): Observable<T> {
  return of(param);
}

let searchHandler;
let mockSearchService;
let orderService;
let onJurisdictionHandler: any;

const TEST_FORM_GROUP = new FormGroup({});
const METADATA_FIELDS = ['PersonLastName'];
const searchfiltervalue = `{\"PersonLastName\":null,\"PersonFirstName\":\"CaseFirstName\",`
  + `\"PersonAddress\":{\"AddressLine1\":null,\"AddressLine2\":null,\"AddressLine3\":null,`
  + `\"PostTown\":null,\"County\":null,\"PostCode\":null,\"Country\":null}}`;

describe('SearchFiltersComponent', () => {

  let fixture: ComponentFixture<SearchFiltersComponent>;
  let component: SearchFiltersComponent;
  let de: DebugElement;
  let jurisdictionService: JurisdictionService;
  let windowService;
  beforeEach(waitForAsync(() => {
    searchHandler = createSpyObj('searchHandler', ['applyFilters', 'resetFilters']);
    mockSearchService = createSpyObj('mockSearchService', ['getSearchInputs']);
    orderService = createSpyObj('orderService', ['sortAsc']);
    jurisdictionService = new JurisdictionService();
    windowService = createSpyObj('windowService', ['setLocalStorage', 'getLocalStorage']);

    onJurisdictionHandler = createSpyObj('onJurisdictionHandler', ['applyJurisdiction']);
    onJurisdictionHandler.applyJurisdiction.and.returnValue();

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          SearchFiltersComponent,
          FieldWriteComponent
        ], providers: [
          { provide: SearchService, useValue: mockSearchService },
          { provide: OrderService, useValue: orderService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: WindowService, useValue: windowService }
        ]
      })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SearchFiltersComponent);
        component = fixture.componentInstance;

        component.onJurisdiction.subscribe(onJurisdictionHandler.applyJurisdiction);

        component.formGroup = TEST_FORM_GROUP;
        component.jurisdictions = [
          JURISDICTION_1,
          JURISDICTION_2
        ];
        component.onApply.subscribe(searchHandler.applyFilters);
        component.onReset.subscribe(searchHandler.resetFilters);

        de = fixture.debugElement;
        fixture.detectChanges();
      });
  }));

  it('should select the jurisdiction if there is only one jurisdiction', waitForAsync(() => {
    resetCaseTypes(JURISDICTION_1, []);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_1];
    fixture.detectChanges();
    component.autoApply = true;
    component.ngOnInit();

    fixture
      .whenStable()
      .then(() => {
        expect(component.selected.jurisdiction).toBe(JURISDICTION_1);
        expect(component.selected.caseType).toBe(null);
      });
  }));

  it('should emit on apply if autoApply is true', waitForAsync(() => {
    component.autoApply = true;
    component.ngOnInit();

    fixture
      .whenStable()
      .then(() => {
        expect(searchHandler.applyFilters).toHaveBeenCalledWith({
          selected: {formGroup: TEST_FORM_GROUP, page: 1, metadataFields: undefined},
          queryParams: {}
        });
      });
  }));

  it('should select the first caseType from LocalStorage', () => {
    resetCaseTypes(JURISDICTION_3, [CASE_TYPE_1, CASE_TYPE_2]);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_3];
    windowService.getLocalStorage.and.returnValues(undefined, JSON.stringify(CASE_TYPE_2));
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.selected.jurisdiction).toBe(JURISDICTION_3);
    expect(component.selected.caseType).toBe(CASE_TYPE_2);
    expect(component.isSearchableAndSearchInputsReady).toBeTruthy();
  });

  it('should select the first caseType from newly selected jurisdiction if nothing in LocalStorage', () => {
    resetCaseTypes(JURISDICTION_3, [CASE_TYPE_1, CASE_TYPE_2]);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_3];
    windowService.getLocalStorage.and.returnValues(undefined, undefined);
    fixture.detectChanges();
    component.ngOnInit();

    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(component.selected.jurisdiction).toBe(JURISDICTION_3);
    expect(component.selected.caseType).toBe(CASE_TYPE_1);
    expect(component.isSearchableAndSearchInputsReady).toBeTruthy();
  });

  it('should select the first caseType from newly selected jurisdiction if not in LocalStorage already', () => {
    resetCaseTypes(JURISDICTION_3, [CASE_TYPE_2]);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_3];
    windowService.getLocalStorage.and.returnValues(undefined, JSON.stringify(CASE_TYPE_1));
    fixture.detectChanges();
    component.ngOnInit();

    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(component.selected.jurisdiction).toBe(JURISDICTION_3);
    expect(component.selected.caseType).toBe(CASE_TYPE_2);
    expect(component.isSearchableAndSearchInputsReady).toBeTruthy();
  });

  it('should select the first caseType from newly selected jurisdiction if different in LocalStorage already', () => {
    resetCaseTypes(JURISDICTION_3, [CASE_TYPE_1]);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_3];
    windowService.getLocalStorage.and.returnValues(undefined, JSON.stringify(CASE_TYPE_2));
    fixture.detectChanges();
    component.ngOnInit();

    component.onJurisdictionIdChange();
    fixture.detectChanges();

    expect(component.selected.jurisdiction).toBe(JURISDICTION_3);
    expect(component.selected.caseType).toBe(CASE_TYPE_1);
    expect(component.isSearchableAndSearchInputsReady).toBeTruthy();
  });

  it('should select the caseType when no LocalStorage is present', () => {
    resetCaseTypes(JURISDICTION_1, [CASE_TYPE_1, CASE_TYPE_2]);
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.jurisdictions = [JURISDICTION_1];
    fixture.detectChanges();
    component.ngOnInit();
    fixture.detectChanges();
    expect(component.selected.jurisdiction).toBe(JURISDICTION_1);
    expect(component.selected.caseType).toBe(CASE_TYPE_1);
    expect(component.isSearchableAndSearchInputsReady).toBeTruthy();
  });

  it('should ignore error and reset input fields', () => {
    resetCaseTypes(JURISDICTION_1, [CASE_TYPE_1, CASE_TYPE_2]);
    component.selected.jurisdiction = JURISDICTION_1;
    component.selected.caseType = CASE_TYPE_1;
    component.jurisdictions = [JURISDICTION_1];
    mockSearchService.getSearchInputs.and.returnValue(throwError(new Error('Response expired')));
    component.onJurisdictionIdChange();
    expect(component.searchInputsReady).toBeFalsy();
    expect(component.searchInputs.length).toBe(0);
  });

  it('should initialise jurisdiction selector with given jurisdictions', () => {
    const selector = de.query(By.css('#s-jurisdiction'));

    expect(selector.children.length).toEqual(2);

    const juris1 = selector.children[0];
    expect(juris1.nativeElement.textContent).toEqual(JURISDICTION_1.name);

    const juris2 = selector.children[1];
    expect(juris2.nativeElement.textContent).toEqual(JURISDICTION_2.name);
  });

  it('should update and announce selected jurisdiction', waitForAsync(() => {
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.selected.jurisdiction = JURISDICTION_1;
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    const selector = de.query(By.css('#s-jurisdiction'));
    fixture
      .whenStable()
      .then(() => {
        expect(selector.nativeElement.selectedIndex).toEqual(0);
        expect(component.selected.jurisdiction).toBe(JURISDICTION_1);
        expect(onJurisdictionHandler.applyJurisdiction).toHaveBeenCalledWith(JURISDICTION_1);
      });
  }));

  it('should populate case types dropdown with CRUD filtered case types', waitForAsync(() => {
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    const selector = de.query(By.css('#s-case-type'));
    expect(selector.children.length).toEqual(0);

    resetCaseTypes(JURISDICTION_1, CRUD_FILTERED_CASE_TYPES);
    component.selected.jurisdiction = JURISDICTION_1;
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    fixture
      .whenStable()
      .then(() => {
        expect(selector.children.length).toEqual(3);

        const juris1 = selector.children[0];
        expect(juris1.nativeElement.textContent).toEqual(CRUD_FILTERED_CASE_TYPES[0].name);

        const juris2 = selector.children[1];
        expect(juris2.nativeElement.textContent).toEqual(CRUD_FILTERED_CASE_TYPES[1].name);
      });
  }));

  it('should initialise case type selector with types from selected jurisdiction', () => {
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.selected.jurisdiction = JURISDICTION_2;
    resetCaseTypes(JURISDICTION_2, CASE_TYPES_2);
    component.onJurisdictionIdChange();
    fixture.detectChanges();

    const selector = de.query(By.css('#s-case-type'));
    expect(selector.children.length).toEqual(4);

    const ct1 = selector.children[0];
    expect(ct1.nativeElement.textContent).toEqual(CASE_TYPES_2[0].name);

    const ct2 = selector.children[1];
    expect(ct2.nativeElement.textContent).toEqual(CASE_TYPES_2[1].name);

    const ct3 = selector.children[2];
    expect(ct3.nativeElement.textContent).toEqual(CASE_TYPES_2[2].name);
  });

  it('should update selected case type', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selectedJurisdictionCaseTypes = CASE_TYPES_2;
    component.selected.caseType = CASE_TYPES_2[2];
    fixture.detectChanges();
    fixture
      .whenStable()
      .then(() => {
        const selector = de.query(By.css('#s-case-type'));
        expect(selector.nativeElement.selectedIndex).toEqual(2);
        expect(component.selected.caseType).toBe(CASE_TYPES_2[2]);
      });
  }));

  it('should have an apply button enabled when case type is set', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    component.onCaseTypeIdChange();
    fixture.detectChanges();
    const button = de.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeFalsy();

  }));

  it('should have an apply button disabled nor search inputs retrieved when case type is not set', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    fixture.detectChanges();

    const button = de.query(By.css('button'));
    expect(button.nativeElement.disabled).toBeTruthy();
    expect(mockSearchService.getSearchInputs).toHaveBeenCalledTimes(0);
  }));

  it('should have form group details added when apply button is clicked ', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_3;
    component.selected.metadataFields = METADATA_FIELDS;
    component.apply();
    expect(searchHandler.applyFilters).toHaveBeenCalledWith({
      selected: component.selected,
      queryParams: {jurisdiction: component.selected.jurisdiction.id}
    });
    expect(component.selected.formGroup.value).toEqual(TEST_FORM_GROUP.value);
  }));

  it('should have metadata fields added when apply button is clicked', waitForAsync(() => {
    component.searchInputs = TEST_SEARCH_INPUTS;

    component.apply();

    expect(component.selected.metadataFields).toEqual(METADATA_FIELDS);
  }));

  it('should update search input when case type is reset', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    mockSearchService.getSearchInputs.and.returnValue(of([]));
    windowService.getLocalStorage.and.returnValue('{}');
    component.onCaseTypeIdChange();
    expect(mockSearchService.getSearchInputs).toHaveBeenCalledWith(JURISDICTION_2.id, CASE_TYPES_2[2].id);
  }));

  it('should order search inputs', waitForAsync(() => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));

    component.onCaseTypeIdChange();

    expect(orderService.sortAsc).toHaveBeenCalled();
  }));

  it('should render an input for each defined search input', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const dynamicFilters = de.query(By.css('#dynamicFilters'));
    expect(dynamicFilters.children.length).toBe(TEST_SEARCH_INPUTS.length);
  });

  it('should render a valid search input field component', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const firstInput = TEST_SEARCH_INPUTS[0];

    const dynamicFilters = de.query(By.css('#dynamicFilters'));

    const writeField = dynamicFilters.query(By.directive(FieldWriteComponent));

    const writeFieldInstance = writeField.componentInstance;
    expect(writeFieldInstance.caseField.id).toEqual(firstInput.field.id);
    expect(writeFieldInstance.caseField.label).toEqual(firstInput.field.label);
    expect(writeFieldInstance.formGroup).toBeTruthy();
  });

  it('should render a valid search input complex field component with a path defined', () => {
    component.selected.jurisdiction = JURISDICTION_2;
    component.selected.caseType = CASE_TYPES_2[2];
    const complexFieldSearchInput = TEST_SEARCH_INPUTS[2];
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom([complexFieldSearchInput]));

    const expectedFieldId = complexFieldSearchInput.field.id + '.' + complexFieldSearchInput.field.elementPath;

    component.onCaseTypeIdChange();
    fixture.detectChanges();

    const dynamicFilters = de.query(By.css('#dynamicFilters'));
    const writeField = dynamicFilters.query(By.directive(FieldWriteComponent));
    const writeFieldInstance = writeField.componentInstance;

    expect(writeFieldInstance.caseField.id).toEqual(expectedFieldId);
    expect(writeFieldInstance.formGroup).toBeTruthy();
  });

  it('should submit filters when apply button is clicked', waitForAsync(() => {
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    searchHandler.applyFilters.calls.reset();
    component.selected.jurisdiction = JURISDICTION_3;
    component.selected.caseType = CASE_TYPES_2[3];

    const control = new FormControl('test');
    control.setValue('anything');
    const formControls = {
      name: control
    };

    const formGroup = new FormGroup(formControls);

    component.onCaseTypeIdChange();
    fixture.detectChanges();
    fixture
      .whenStable()
      .then(() => {
        const button = de.query(By.css('button'));
        component.formGroup = formGroup;
        button.nativeElement.click();
        const arg: any = searchHandler.applyFilters.calls.mostRecent().args[0].selected;
        expect(arg['jurisdiction']).toEqual(JURISDICTION_3);
        expect(arg['caseType']).toEqual(CASE_TYPES_2[3]);
        expect(arg['formGroup'].value).toEqual(formGroup.value);
        expect(searchHandler.applyFilters).toHaveBeenCalledTimes(1);

      });
  }));
});
describe('Clear localStorage', () => {

  let fixture: ComponentFixture<SearchFiltersComponent>;
  let component: SearchFiltersComponent;
  let de: DebugElement;
  let jurisdictionService: JurisdictionService;
  let windowService: WindowService;

  beforeEach(waitForAsync(() => {
    searchHandler = createSpyObj('searchHandler', ['applyFilters', 'applyReset']);
    mockSearchService = createSpyObj('mockSearchService', ['getSearchInputs']);
    orderService = createSpyObj('orderService', ['sortAsc']);
    jurisdictionService = new JurisdictionService();
    windowService = createSpyObj('windowService', ['clearLocalStorage', 'locationAssign', 'getLocalStorage', 'removeLocalStorage']);

    TestBed
      .configureTestingModule({
        imports: [
          FormsModule,
          ReactiveFormsModule,
          ConditionalShowModule
        ],
        declarations: [
          SearchFiltersComponent,
          FieldWriteComponent
        ], providers: [
          { provide: SearchService, useValue: mockSearchService },
          { provide: OrderService, useValue: orderService },
          { provide: JurisdictionService, useValue: jurisdictionService },
          { provide: WindowService, useValue: windowService }
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(SearchFiltersComponent);
    component = fixture.componentInstance;

    component.formGroup = TEST_FORM_GROUP;
    component.jurisdictions = [
      JURISDICTION_1,
      JURISDICTION_2
    ];
    component.onReset.subscribe(searchHandler.applyReset);

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should emit on reset if reset is clicked', waitForAsync(() => {
    component.reset();

    fixture
      .whenStable()
      .then(() => {
        expect(searchHandler.applyReset).toHaveBeenCalled();
      });
  }));

  it('should remove localStorage once reset button is clicked', waitForAsync(() => {
    mockSearchService.getSearchInputs.and.returnValue(createObservableFrom(TEST_SEARCH_INPUTS));
    searchHandler.applyReset.calls.reset();
    component.selected.jurisdiction = JURISDICTION_3;
    component.selected.caseType = CASE_TYPES_2[3];

    const control = new FormControl('test');
    control.setValue('anything');
    const formControls = {
      name: control
    };

    const formGroup = new FormGroup(formControls);

    component.onCaseTypeIdChange();
    fixture.detectChanges();
    fixture
      .whenStable()
      .then(() => {
        const button = de.query(By.css('#reset'));
        component.formGroup = formGroup;
        button.nativeElement.click();
        expect(windowService.removeLocalStorage).toHaveBeenCalledTimes(4);

      });

  }));
});

function resetCaseTypes(jurisdiction: Jurisdiction, caseTypes: CaseType[]) {
  jurisdiction.caseTypes.splice(0, jurisdiction.caseTypes.length);
  caseTypes.forEach(caseType => jurisdiction.caseTypes.push(caseType));
}
