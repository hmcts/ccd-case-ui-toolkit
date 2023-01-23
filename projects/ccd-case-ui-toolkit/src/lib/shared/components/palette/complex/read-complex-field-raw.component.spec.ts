import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField, FieldType } from '../../../domain';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { text } from '../../../test/helpers';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadComplexFieldRawComponent } from './read-complex-field-raw.component';

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
        ReadFieldsFilterPipe,
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
  expect(de.componentInstance.caseField).toEqual(caseField);
};

const expectCaseFieldPartial = (de, caseField) => {
  expect(de.componentInstance.caseField).toEqual(jasmine.objectContaining(caseField));
};

const expectLabel = (de: DebugElement, label) => {
  expect(text(de)).toEqual(label);
};

const expectContext = (de, expectedContext) => {
  expect(de.componentInstance.context).toEqual(expectedContext);
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
      inputs: ['caseField', 'caseFields', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix']
    });
  });

  describe('when simple values split across children fields', () => {
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road'
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_VALUES
      }) as CaseField);

      const test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render a list', () => {
      const complexList = de.query($COMPLEX_LIST);

      expect(complexList).toBeTruthy();
    });

    it('should render one list item per child field', () => {
      const complexListItems = de.queryAll($COMPLEX_LIST_ITEMS);

      expect(complexListItems.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
    });

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectCaseFieldPartial(complexListValues[0], FIELD_TYPE_WITH_VALUES.complex_fields[0]);
      expectCaseFieldPartial(complexListValues[1], FIELD_TYPE_WITH_VALUES.complex_fields[1]);
      expectCaseFieldPartial(complexListValues[2], FIELD_TYPE_WITH_VALUES.complex_fields[2]);
    });

    it('should render one field read component per child field', () => {
      const complexListLabels = de.queryAll($COMPLEX_LIST_LABELS);

      expect(complexListLabels.length).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields.length);
      expectLabel(complexListLabels[0], FIELD_TYPE_WITH_VALUES.complex_fields[0].label);
      expectLabel(complexListLabels[1], FIELD_TYPE_WITH_VALUES.complex_fields[1].label);
      expectLabel(complexListLabels[2], FIELD_TYPE_WITH_VALUES.complex_fields[2].label);
    });

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

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
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: ''
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Poplar'
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      }) as CaseField);

      const test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITH_MISSING_VALUE.complex_fields.length - 1);
      expectCaseFieldPartial(complexListValues[0], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[0]);
      expectCaseFieldPartial(complexListValues[1], FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[2]);
    });

  });

  describe('when simple values as object on root field', () => {
    const FIELD_TYPE_WITHOUT_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField =  (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          AddressLine1: 'Flat 9',
          AddressLine2: '111 East India road',
          AddressLine3: 'Poplar',
        }
      }) as CaseField);

      const test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should render one field read component per child field', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length);
      expectCaseFieldPartial(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseFieldPartial(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[1],
        {
          value: caseField.value['AddressLine2']
        }
      ));
      expectCaseFieldPartial(complexListValues[2], Object.assign(
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
        ({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
          ({
          id: 'AddressLine3',
          label: 'Line 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
        }) as CaseField,
      ]
    };

    let caseField: CaseField;

    beforeEach(waitForAsync(() => {
      caseField = (({
        id: '',
        label: 'Complex Field',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_VALUES,
        value: {
          AddressLine1: 'Flat 9',
          AddressLine3: 'Poplar',
        }
      }) as CaseField);

      const test = initTests(caseField, [
        FieldReadComponent
      ]);
      de = test.de;
      fixture = test.fixture;
      component = test.component;
    }));

    it('should omit child fields with empty values', () => {
      const complexListValues = de.queryAll($COMPLEX_LIST_VALUES);

      expect(complexListValues.length).toEqual(FIELD_TYPE_WITHOUT_VALUES.complex_fields.length - 1);
      expectCaseFieldPartial(complexListValues[0], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[0],
        {
          value: caseField.value['AddressLine1']
        }
      ));
      expectCaseFieldPartial(complexListValues[1], Object.assign(
        {},
        FIELD_TYPE_WITHOUT_VALUES.complex_fields[2],
        {
          value: caseField.value['AddressLine3']
        }
      ));
    });

  });

});
