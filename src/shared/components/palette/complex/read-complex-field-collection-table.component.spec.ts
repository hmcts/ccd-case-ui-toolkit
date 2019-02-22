import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadComplexFieldCollectionTableComponent } from './read-complex-field-collection-table.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { By } from '@angular/platform-browser';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { PaletteContext } from '../base-field/palette-context.enum';

describe('ReadComplexFieldCollectionTableComponent', () => {

  const $COMPLEX_PANEL = By.css('div.complex-panel');
  const $COMPLEX_PANEL_TITLE = By.css('dl.complex-panel-title');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS = By.css('div>table>tbody>tr>th>span');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS_CLICK = By.css('div>table>tbody>tr>th>a');
  const $COMPLEX_PANEL_SIMPLE_ROWS_VALUES = By.css('div>table>tbody>tr>td>div>ccd-field-read');
  const $COMPLEX_PANEL_COMPOUND_ROWS_VALUES = By.css('table>tbody>tr.complex-panel-compound-field>td>span>ccd-field-read');
  const $COMPLEX_PANEL_ALL_VALUES = By.css('table>tbody>tr>td>span>ccd-field-read');
  const UNORDERED = '&#9650;';
  const FIRST_COLUMN = 'AddressLine1';
  const SECOND_COLUMN = 'AddressLine2';

  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context']
  });

  let fixture: ComponentFixture<ReadComplexFieldCollectionTableComponent>;
  let component: ReadComplexFieldCollectionTableComponent;
  let de: DebugElement;

  describe('when values split accross children fields', () => {
    const FIELD_TYPE_WITHOUT_FIELDS: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: []
    };

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
          value: ''
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
        }
      ]
    };

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
            id: 'Number',
            type: 'Number'
          },
          value: '111 East India road'
        },
        {
          id: 'AddressPostcode',
          label: 'Post code',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'tw45ed'
        }
      ]
    };

    const CASE_FIELD: CaseField = {
      id: '',
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      value: [
        {
          value: {
            label: 'SomeLabel',
            AddressLine1: 'Flat 9',
            AddressLine2: 222,
​​​            AddressPostcode: 'TE45ED'
          }
        }, {
          value: {
            label: 'Label 1',
              AddressLine1: 'AAFlat 10',
              AddressLine2: 111,
    ​​​            AddressPostcode: 'TE45ED'
          }
        }
  ],
    display_context_parameter: '#TABLE(AddressLine1, AddressLine2)',
      field_type
  :
    FIELD_TYPE_WITH_VALUES
  }
    ;

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            ReadComplexFieldCollectionTableComponent,
            FieldsFilterPipe,

            // Mock
            FieldReadComponent,
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldCollectionTableComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.context = PaletteContext.TABLE_VIEW;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a panel with a header for the complex type', () => {
      let panelTitle = de
        .query($COMPLEX_PANEL)
        .query($COMPLEX_PANEL_TITLE);

      expect(panelTitle).toBeTruthy();
      expect(panelTitle.nativeElement.textContent).toBe(CASE_FIELD.label);
    });

    it('should render a table with a row containing 2 columns for each simple type', () => {
      let simpleRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);
      expect(simpleRowsHeaders.length).toBe(2);
      expect(simpleRowsHeaders[LINE_1].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(simpleRowsHeaders[LINE_2].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);

      let simpleRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_VALUES);
      expect(simpleRowsValues.length).toBe(4);
      expect(simpleRowsValues[0].componentInstance.caseField.value).toEqual(CASE_FIELD.value[0].value[FIRST_COLUMN]);
      expect(simpleRowsValues[1].componentInstance.caseField.value).toEqual(CASE_FIELD.value[0].value[SECOND_COLUMN]);
      expect(simpleRowsValues[2].componentInstance.caseField.value).toEqual(CASE_FIELD.value[1].value[FIRST_COLUMN]);
      expect(simpleRowsValues[3].componentInstance.caseField.value).toEqual(CASE_FIELD.value[1].value[SECOND_COLUMN]);

      let simpleRowsHeadersClickers = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS_CLICK);
      expect(simpleRowsHeadersClickers.length).toBe(2);

      expect(simpleRowsHeadersClickers[0].properties.innerHTML).toEqual(UNORDERED);
      expect(simpleRowsHeadersClickers[1].properties.innerHTML).toEqual(UNORDERED);

    });

    it('should sort rows based on column name', () => {
      expect(component.rows[0].AddressLine1).toEqual(CASE_FIELD.value[0].value[FIRST_COLUMN]);
      component.sortRowsByColumns('AddressLine1');
      expect(component.rows[0].AddressLine1).toEqual(CASE_FIELD.value[1].value[FIRST_COLUMN]);
      component.sortRowsByColumns('AddressLine1');
      expect(component.rows[0].AddressLine1).toEqual(CASE_FIELD.value[0].value[FIRST_COLUMN]);
    });

    it('should sort rows based on Number type', () => {
      expect(component.rows[0].AddressLine2).toEqual(CASE_FIELD.value[0].value[SECOND_COLUMN]);
      component.sortRowsByColumns('AddressLine2');
      expect(component.rows[0].AddressLine2).toEqual(CASE_FIELD.value[1].value[SECOND_COLUMN]);
      component.sortRowsByColumns('AddressLine2');
      expect(component.rows[0].AddressLine2).toEqual(CASE_FIELD.value[0].value[SECOND_COLUMN]);
    });

  });

});
