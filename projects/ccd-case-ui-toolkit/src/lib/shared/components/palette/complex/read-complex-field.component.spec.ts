import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField, FieldType } from '../../../domain/definition';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadComplexFieldComponent } from './read-complex-field.component';

const inputs: string[] = ['caseField', 'caseFields', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix'];

describe('ReadComplexFieldComponent', () => {
  let readComplexFieldRawComponentMock;
  let readComplexFieldTableComponentMock;
  let readComplexFieldNewTableComponentMock;

  function setupComponents() {
    readComplexFieldRawComponentMock = MockComponent({
      selector: 'ccd-read-complex-field-raw',
      inputs
    });

    readComplexFieldTableComponentMock = MockComponent({
      selector: 'ccd-read-complex-field-table',
      inputs
    });

    readComplexFieldNewTableComponentMock = MockComponent({
      selector: 'ccd-read-complex-field-collection-table',
      inputs: ['caseField', 'context', 'formGroup', 'topLevelFormGroup', 'idPrefix']
    });
  }

  describe('Non-persistable readonly complex field', () => {
    describe('when context is DEFAULT or CHECK_YOUR_ANSWER', () => {
      const $COMPLEX_AS_TABLE = By.css('ccd-read-complex-field-table');
      const $COMPLEX_AS_COLLECTION_TABLE = By.css('ccd-read-complex-field-collection-table');
      const $COMPLEX_AS_RAW = By.css('ccd-read-complex-field-raw');

      const caseField: CaseField = new CaseField();
      const FORM_GROUP: FormGroup = new FormGroup({});

      let fixture: ComponentFixture<ReadComplexFieldComponent>;
      let component: ReadComplexFieldComponent;
      let de: DebugElement;

      const expectTable = () => {
        expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
        expect(de.query($COMPLEX_AS_TABLE)).toBeTruthy();
      };

      const expectRaw = () => {
        expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
        expect(de.query($COMPLEX_AS_RAW)).toBeTruthy();
      };

      const expectCollectionTable = () => {
        expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
        expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
        expect(de.query($COMPLEX_AS_COLLECTION_TABLE)).toBeTruthy();
      };

      const expectInputs = (componentInstance, expectedContext) => {
        expect(componentInstance.caseField).toBe(caseField);
        expect(componentInstance.context).toBe(expectedContext);
      };

      beforeEach(waitForAsync(() => {
        setupComponents();

        TestBed
          .configureTestingModule({
            imports: [
              PaletteUtilsModule,
              ConditionalShowModule,
              readComplexFieldRawComponentMock,
              readComplexFieldTableComponentMock,
              readComplexFieldNewTableComponentMock
            ],
            declarations: [
              ReadComplexFieldComponent,
              FieldsFilterPipe
            ],
            providers: []
          })
          .compileComponents();

        fixture = TestBed.createComponent(ReadComplexFieldComponent);
        component = fixture.componentInstance;
        component.caseField = caseField;
        component.formGroup = FORM_GROUP;
        component.context = null;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should render complex field as table by default', () => {
        expectTable();
        expectInputs(de.query($COMPLEX_AS_TABLE).componentInstance, null);
      });

      describe('when context is DEFAULT', () => {
        beforeEach(() => {
          component.caseField = caseField;
          component.context = PaletteContext.DEFAULT;
          fixture.detectChanges();
        });

        it('should render complex field as table by default', () => {
          expectTable();
          expectInputs(de.query($COMPLEX_AS_TABLE).componentInstance, PaletteContext.DEFAULT);
        });
      });

      describe('when context is CHECK_YOUR_ANSWER', () => {
        beforeEach(() => {
          component.context = PaletteContext.CHECK_YOUR_ANSWER;
          fixture.detectChanges();
        });

        it('should render complex field as table by default', () => {
          expectRaw();
          expectInputs(de.query($COMPLEX_AS_RAW).componentInstance, PaletteContext.CHECK_YOUR_ANSWER);
        });
      });
    });

    describe('when context is TABLE_VIEW', () => {
      const $COMPLEX_AS_TABLE = By.css('ccd-read-complex-field-table');
      const $COMPLEX_AS_COLLECTION_TABLE = By.css('ccd-read-complex-field-collection-table');
      const $COMPLEX_AS_RAW = By.css('ccd-read-complex-field-raw');

      let fixture: ComponentFixture<ReadComplexFieldComponent>;
      let component: ReadComplexFieldComponent;
      let de: DebugElement;
      const caseFieldDsp: CaseField = new CaseField();
      const FORM_GROUP: FormGroup = new FormGroup({});

      const expectCollectionTable = () => {
        expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
        expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
        expect(de.query($COMPLEX_AS_COLLECTION_TABLE)).toBeTruthy();
      };
      const expectInputs = (componentInstance, expectedContext) => {
        expect(componentInstance.caseField).toBe(caseFieldDsp);
        expect(componentInstance.context).toBe(expectedContext);
      };

      caseFieldDsp.display_context_parameter = '#TABLE(AddressLine1, AddressLine2)';

      beforeEach(waitForAsync(() => {
        setupComponents();

        TestBed
          .configureTestingModule({
            imports: [
              PaletteUtilsModule,
              ConditionalShowModule,
              readComplexFieldRawComponentMock,
              readComplexFieldTableComponentMock,
              readComplexFieldNewTableComponentMock
            ],
            declarations: [
              ReadComplexFieldComponent,
              FieldsFilterPipe
            ],
            providers: []
          })
          .compileComponents();

        fixture = TestBed.createComponent(ReadComplexFieldComponent);
        component = fixture.componentInstance;
        component.caseField = caseFieldDsp;
        component.formGroup = FORM_GROUP;
        component.context = null;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('should render complex field as table by default', () => {
        expectCollectionTable();
        expectInputs(de.query($COMPLEX_AS_COLLECTION_TABLE).componentInstance, PaletteContext.TABLE_VIEW);
      });
    });
  });

  describe('Persistable readonly complex field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'Complex',
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
          value: 'Flat 9',
          isDynamic: () => false
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road',
          isDynamic: () => false
        }) as CaseField
      ]
    };

    const FIELD_ID = 'AComplexField';
    const VALUE = {
      AddressLine1: '1 West',
      AddressLine2: 'South'
    };
    /* eslint:disable-next-line */
    const CASE_FIELD = ({
      id: FIELD_ID,
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES,
      value: VALUE,
      isDynamic: (() => { })
    }) as CaseField;

    let fixture: ComponentFixture<ReadComplexFieldComponent>;
    let component: ReadComplexFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      setupComponents();

      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule,
            readComplexFieldRawComponentMock,
            readComplexFieldTableComponentMock,
            readComplexFieldNewTableComponentMock
          ],
          declarations: [
            ReadComplexFieldComponent,
            FieldsFilterPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });

  });

  describe('Persistable readonly complex field with dynamic lists', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'Complex',
      type: 'Complex',
      complex_fields: [
        ({
          id: 'DynamicListWithValue',
          label: 'Dynamic list 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'DynamicList',
            type: 'DynamicList'
          },
          isDynamic: () => true
        }) as CaseField,
        ({
          id: 'DynamicListWithCode',
          label: 'Dynamic list 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'DynamicList',
            type: 'DynamicList'
          },
          isDynamic: () => true
        }) as CaseField,
        ({
          id: 'DynamicListWithNoCaseFieldValue',
          label: 'Dynamic list 3',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'DynamicList',
            type: 'DynamicList'
          },
          isDynamic: () => true
        }) as CaseField
      ]
    };

    const FIELD_ID = 'AComplexField';
    const VALUE = {
      DynamicListWithValue: {
        list_items: ['One', 'Two'],
        value: 'One'
      },
      DynamicListWithCode: {
        list_items: [
          {
            code: '1',
            label: 'One'
          },
          {
            code: '2',
            label: 'Two'
          }
        ],
        value: {
          code: '1',
          label: 'One'
        }
      },
      DynamicListWithNoCaseFieldValue: null
    };
    /* eslint:disable-next-line */
    const CASE_FIELD = ({
      id: FIELD_ID,
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES,
      value: VALUE,
      isDynamic: (() => {})
    }) as CaseField;

    let fixture: ComponentFixture<ReadComplexFieldComponent>;
    let component: ReadComplexFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      setupComponents();

      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule,
            readComplexFieldRawComponentMock,
            readComplexFieldTableComponentMock,
            readComplexFieldNewTableComponentMock
          ],
          declarations: [
            ReadComplexFieldComponent,
            FieldsFilterPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should populate DynamicList field values', () => {
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[0].list_items).toEqual(VALUE.DynamicListWithValue.list_items);
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[0].value).toEqual(VALUE.DynamicListWithValue);
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[1].list_items).toEqual(VALUE.DynamicListWithCode.list_items);
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[1].value).toEqual({
        list_items: VALUE.DynamicListWithCode.list_items,
        value: VALUE.DynamicListWithCode.value.code
      });
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[2].list_items).toBeUndefined();
      expect(FIELD_TYPE_WITH_VALUES.complex_fields[2].value).toEqual({
        list_items: undefined,
        value: undefined
      });
    });
  });
});
