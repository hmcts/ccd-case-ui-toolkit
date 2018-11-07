import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldType } from '../../../domain/definition/field-type.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { CaseField } from '../../../domain/definition/case-field.model';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { text } from '../../../test/helpers';

const initTests = (caseField, mocks) => {
  let fixture: ComponentFixture<ReadComplexFieldRawComponent>;
  let component: ReadComplexFieldRawComponent;
  let de: DebugElement;

  TestBed
    .configureTestingModule({
      imports: [
        PaletteUtilsModule,
        ConditionalShowModule
      ],
      declarations: [
        ReadComplexFieldRawComponent,
        FieldsFilterPipe,

        ...mocks
      ],
      providers: []
    })
    .compileComponents();

  fixture = TestBed.createComponent(ReadComplexFieldRawComponent);
  component = fixture.componentInstance;

  component.caseField = caseField;
  component.context = PaletteContext.CHECK_YOUR_ANSWER;

  de = fixture.debugElement;
  fixture.detectChanges();

  return {
    de,
    component,
    fixture,
  };
};

const expectCaseField = (de, caseField) => {
  expect(de.componentInstance.caseField).toEqual(caseField)
};

const expectLabel = (de: DebugElement, label) => {
  expect(text(de)).toEqual(label)
};

const expectContext = (de, expectedContext) => {
  expect(de.componentInstance.context).toEqual(expectedContext)
};

describe('ReadComplexFieldRawComponent', () => {

  const $COMPLEX_LIST = By.css('dl.complex-raw');
  const $COMPLEX_LIST_ITEMS = By.css('dl.complex-raw>dd');
  const $COMPLEX_LIST_LABELS = By.css('dl.complex-raw>dt');
  const $COMPLEX_LIST_VALUES = By.css('dl.complex-raw>dd>ccd-field-read');

  let FieldReadComponent;

  let fixture: ComponentFixture<ReadComplexFieldRawComponent>;
  let component: ReadComplexFieldRawComponent;
  let de: DebugElement;

  beforeEach(() => {
    FieldReadComponent = MockComponent({
      selector: 'ccd-field-read',
      inputs: ['caseField', 'context']
    });
  });

  describe('when simple values split across children fields', () => {
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        {
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        },
        {
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road'
        },
        {
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        },
      ]
    };

    let caseField: CaseField;

    beforeEach(async(() => {
      caseField = {
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_VALUES
      };

      let test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render a list', () => {
      let complexList = de.query($COMPLEX_LIST);

      expect(complexList).toBeTruthy();
    });

    it('should render one list item per child field', () => {
      let complexListItems = de.queryAll($COMPLEX_LIST_ITEMS);

      expect(complexListItems.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
    });

    it('should render one field read component per child field', () => {
      let complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectCaseField(complexListValues[0], FIELD_TYPE_WITH_VALUES.complex_fields[0]);
      expectCaseField(complexListValues[1], FIELD_TYPE_WITH_VALUES.complex_fields[1]);
      expectCaseField(complexListValues[2], FIELD_TYPE_WITH_VALUES.complex_fields[2]);
    });

    it('should render one field read component per child field', () => {
      let complexListLabels = de.queryAll($COMPLEX_LIST_LABELS);

      expect(complexListLabels.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectLabel(complexListLabels[0], FIELD_TYPE_WITH_VALUES.complex_fields[0].label);
      expectLabel(complexListLabels[1], FIELD_TYPE_WITH_VALUES.complex_fields[1].label);
      expectLabel(complexListLabels[2], FIELD_TYPE_WITH_VALUES.complex_fields[2].label);
    });

    it('should render one field read component per child field', () => {
      let complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expectContext(complexListValues[0], PaletteContext.CHECK_YOUR_ANSWER);
      expectContext(complexListValues[1], PaletteContext.CHECK_YOUR_ANSWER);
      expectContext(complexListValues[2], PaletteContext.CHECK_YOUR_ANSWER);
    });

  });

  describe('when empty values split across children fields', () => {
    const FIELD_TYPE_WITH_MISSING_VALUE: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        {
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        },
        {
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: ''
        },
        {
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        },
      ]
    };

    let caseField: CaseField;

    beforeEach(async(() => {
      caseField = {
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      };

      let test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      let complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_MISSING_VALUE.complex_fields.length - 1);
      expectCaseField(complexListValues[0], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[0]);
      expectCaseField(complexListValues[1], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[2]);
    });

  });

  describe('when simple values as object on root field', () => {
    const FIELD_TYPE_WITHOUT_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        {
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
        {
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
        {
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
      ]
    };

    let caseField: CaseField;

    beforeEach(async(() => {
      caseField = {
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          'AddressLine1': 'Flat 9',
          'AddressLine2': '111 East India road',
          'AddressLine3': 'Poplar',
        }
      };

      let test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render one field read component per child field', () => {
      let complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length);
      expectCaseField(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseField(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[1],
        {
          value: caseField.value['AddressLine2']
        }
      ));
      expectCaseField(complexListValues[2], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[2],
        {
          value: caseField.value['AddressLine3']
        }
      ));
    });

  });

  describe('when empty values as object on root field', () => {
    const FIELD_TYPE_WITHOUT_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        {
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
        {
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
        {
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        },
      ]
    };

    let caseField: CaseField;

    beforeEach(async(() => {
      caseField = {
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          'AddressLine1': 'Flat 9',
          'AddressLine3': 'Poplar',
        }
      };

      let test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      let complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length - 1);
      expectCaseField(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseField(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[2],
        {
          value: caseField.value['AddressLine3']
        }
      ));
    });

  });

});
