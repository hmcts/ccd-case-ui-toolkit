import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadComplexFieldNewTableComponent } from './read-complex-field-new-table.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { By } from '@angular/platform-browser';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { PaletteContext } from '../base-field/palette-context.enum';

describe('ReadComplexFieldNewTableComponent', () => {

  const $COMPLEX_PANEL = By.css('div.complex-panel');
  const $COMPLEX_PANEL_TITLE = By.css('dl.complex-panel-title');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS = By.css('table>tbody>tr.complex-panel-simple-field>th>span');
  const $COMPLEX_PANEL_SIMPLE_ROWS_VALUES = By.css('table>tbody>tr.complex-panel-simple-field>td>span>ccd-field-read');
  const $COMPLEX_PANEL_COMPOUND_ROWS_VALUES = By.css('table>tbody>tr.complex-panel-compound-field>td>span>ccd-field-read');
  const $COMPLEX_PANEL_ALL_VALUES = By.css('table>tbody>tr>td>span>ccd-field-read');

  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context']
  });

  let fixture: ComponentFixture<ReadComplexFieldNewTableComponent>;
  let component: ReadComplexFieldNewTableComponent;
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
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road'
        },
        {
          id: 'AddressPostcode',
          label: 'Post code',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Postcode',
            type: 'Complex',
            complex_fields: [
              {
                id: 'PostcodeCity',
                label: 'City',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                },
                value: 'London'
              },
              {
                id: 'PostcodeCountry',
                label: 'Country',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                },
                value: 'UK'
              }
            ]
          }
        }
      ]
    };

    const CASE_FIELD: CaseField = {
      id: '',
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES
    };

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
            ReadComplexFieldNewTableComponent,
            FieldsFilterPipe,

            // Mock
            FieldReadComponent,
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldNewTableComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.context = PaletteContext.CHECK_YOUR_ANSWER;

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

      expect(simpleRowsValues.length).toBe(2);
      expect(simpleRowsValues[LINE_1].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1]);
      expect(simpleRowsValues[LINE_2].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2]);
    });

    it('should render a table with a row containing 1 column for each compound type', () => {
      let compoundRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_COMPOUND_ROWS_VALUES);

      expect(compoundRowsHeaders.length).toBe(1);
      expect(compoundRowsHeaders[0].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[POSTCODE]);
    });

    it('should NOT render fields with empty value', () => {
      component.caseField = {
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      };
      fixture.detectChanges();

      let labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(1);

      expect(labels[0].nativeElement.textContent).toBe(FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[LINE_2].label);
    });

    it('should only render title when no fields', () => {
      component.caseField = {
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_FIELDS
      };
      fixture.detectChanges();

      let title = de.query($COMPLEX_PANEL_TITLE);
      expect(title).toBeTruthy();

      let labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(0);
    });

    it('should pass context down to child fields', () => {
      let simpleRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_VALUES);

      expect(simpleRowsValues[LINE_1].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);
      expect(simpleRowsValues[LINE_2].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);

      let compoundRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_COMPOUND_ROWS_VALUES);

      expect(compoundRowsValues[0].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);
    });
  });

  describe('when values as object in root field', () => {
    const FIELD_TYPE: FieldType = {
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
          }
        },
        {
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          }
        },
        {
          id: 'AddressPostcode',
          label: 'Post code',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Postcode',
            type: 'Complex',
            complex_fields: [
              {
                id: 'PostcodeCity',
                label: 'City',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                }
              },
              {
                id: 'PostcodeCountry',
                label: 'Country',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                }
              }
            ]
          }
        }
      ]
    };

    const CASE_FIELD: CaseField = {
      id: '',
      label: 'Complex Field',
      field_type: FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: {
        'AddressLine1': 'Flat 9',
        'AddressLine2': '111 East India road',
        'AddressPostcode': {
          'PostcodeCity': 'London',
          'PostcodeCountry': 'UK'
        }
      }
    };

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
            ReadComplexFieldNewTableComponent,
            FieldsFilterPipe,

            // Mock
            FieldReadComponent,
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldNewTableComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a table with a row containing 2 columns for each simple type', () => {
      let values = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_ALL_VALUES);

      expect(values.length).toBe(3);

      let line1 = FIELD_TYPE.complex_fields[LINE_1];
      expect(values[LINE_1].componentInstance.caseField).toEqual({
        id: line1.id,
        label: line1.label,
        display_context: 'OPTIONAL',
        field_type: line1.field_type,
        value: CASE_FIELD.value['AddressLine1']
      });

      let line2 = FIELD_TYPE.complex_fields[LINE_2];
      expect(values[LINE_2].componentInstance.caseField).toEqual({
        id: line2.id,
        label: line2.label,
        display_context: 'OPTIONAL',
        field_type: line2.field_type,
        value: CASE_FIELD.value['AddressLine2']
      });

      let postcode = FIELD_TYPE.complex_fields[POSTCODE];
      expect(values[POSTCODE].componentInstance.caseField).toEqual({
        id: postcode.id,
        label: postcode.label,
        display_context: 'OPTIONAL',
        field_type: postcode.field_type,
        value: CASE_FIELD.value['AddressPostcode']
      });
    });

    it('should NOT render fields with empty value', () => {
      component.caseField = {
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: {
          'AddressLine1': 'Flat 9'
        }
      };
      fixture.detectChanges();

      let labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(1);

      expect(labels[0].nativeElement.textContent).toBe(FIELD_TYPE.complex_fields[LINE_1].label);
    });
  });

});
