import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { ConditionalShowRegistrarService } from '../../../directives/conditional-show/services/conditional-show-registrar.service';
import { GreyBarService } from '../../../directives/conditional-show/services/grey-bar.service';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadComplexFieldTableComponent } from './read-complex-field-table.component';

describe('ReadComplexFieldTableComponent', () => {
  const $COMPLEX_PANEL = By.css('div.complex-panel');
  const $COMPLEX_PANEL_TITLE = By.css('dl.complex-panel-title');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS = By.css('table>tbody>tr.complex-panel-simple-field>th>span');
  const $COMPLEX_PANEL_SIMPLE_ROWS_VALUES = By.css('table>tbody>tr.complex-panel-simple-field>td>span>ccd-field-read');
  const $COMPLEX_PANEL_COMPOUND_ROWS_VALUES = By.css('table>tbody>tr.complex-panel-compound-field>td>span>ccd-field-read');
  const $COMPLEX_PANEL_ALL_VALUES = By.css('table>tbody>tr>td>span>ccd-field-read');

  const fieldReadComponentMock = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'context', 'topLevelFormGroup']
  });

  let fixture: ComponentFixture<ReadComplexFieldTableComponent>;
  let component: ReadComplexFieldTableComponent;
  let de: DebugElement;

  describe('when values split across children fields', () => {
    const FIELD_TYPE_WITHOUT_FIELDS: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: []
    };

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
          value: ''
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
        }) as CaseField
      ]
    };

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
          hidden: false,
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
          hidden: false,
          value: '111 East India road'
        }) as CaseField,
        ({
          id: 'AddressPostcode',
          label: 'Post code',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Postcode',
            type: 'Complex',
            complex_fields: [
              ({
                id: 'PostcodeCity',
                label: 'City',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                },
                value: 'London'
              }) as CaseField,
              ({
                id: 'PostcodeCountry',
                label: 'Country',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                },
                value: 'UK'
              }) as CaseField
            ]
          },
          hidden: false
        }) as CaseField
      ]
    };

    const CASE_FIELD: CaseField = ({
      id: '',
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES
    }) as CaseField;

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            ReadComplexFieldTableComponent,
            FieldsFilterPipe,
            ReadFieldsFilterPipe,
            // Mocks
            MockRpxTranslatePipe,
            fieldReadComponentMock
          ],
          providers: [
            FieldsUtils,
            ConditionalShowRegistrarService,
            GreyBarService
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldTableComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.context = PaletteContext.CHECK_YOUR_ANSWER;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a panel with a header for the complex type', () => {
      const panelTitle = de
        .query($COMPLEX_PANEL)
        .query($COMPLEX_PANEL_TITLE);

      expect(panelTitle).toBeTruthy();
      expect(panelTitle.nativeElement.textContent).toBe(CASE_FIELD.label);
    });

    it('should render a table with a row containing 2 columns for each simple type', () => {
      const simpleRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(simpleRowsHeaders.length).toBe(2);
      expect(simpleRowsHeaders[LINE_1].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(simpleRowsHeaders[LINE_2].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);

      const simpleRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_VALUES);

      expect(simpleRowsValues.length).toBe(2);
      expect(simpleRowsValues[LINE_1].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1]);
      expect(simpleRowsValues[LINE_2].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2]);
    });

    it('should render a table with a row containing 1 column for each compound type', () => {
      const compoundRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_COMPOUND_ROWS_VALUES);

      expect(compoundRowsHeaders.length).toBe(1);
      expect(compoundRowsHeaders[0].componentInstance.caseField).toEqual(FIELD_TYPE_WITH_VALUES.complex_fields[POSTCODE]);
    });

    it('should NOT render fields with empty value', () => {
      component.caseField = (({
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      }) as CaseField);
      fixture.detectChanges();

      const labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(1);

      expect(labels[0].nativeElement.textContent).toBe(FIELD_TYPE_WITH_MISSING_VALUE.complex_fields[LINE_2].label);
    });

    it('should only render title when no fields', () => {
      component.caseField = (({
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITHOUT_FIELDS
      }) as CaseField);
      fixture.detectChanges();

      const title = de.query($COMPLEX_PANEL_TITLE);
      expect(title).toBeTruthy();

      const labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(0);
    });

    it('should pass context down to child fields', () => {
      const simpleRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_VALUES);

      expect(simpleRowsValues[LINE_1].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);
      expect(simpleRowsValues[LINE_2].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);

      const compoundRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_COMPOUND_ROWS_VALUES);

      expect(compoundRowsValues[0].componentInstance.context).toEqual(PaletteContext.CHECK_YOUR_ANSWER);
    });

    it('should set the dummy path for child fields correctly', () => {
      component.idPrefix = 'testString';
      component.ngOnInit();
      expect(component.path).toBe(ReadComplexFieldTableComponent.DUMMY_STRING_PRE + component.idPrefix + ReadComplexFieldTableComponent.DUMMY_STRING_POST);
    });

    it('should show child fields based on show conditions', () => {
      component.caseField = (({
        field_type: {
          collection_field_type: null,
          complex_fields: [
            {
              id: 'unavailableDateType',
              display_context: 'MANDATORY',
              field_type: {
                type: 'FixedRadioList'
              }
            },
            {
              id: 'date',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"SINGLE_DATE\"',
              field_type: {
                type: 'Date'
              }
            },
            {
              id: 'fromDate',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"DATE_RANGE\"',
              field_type: {
                type: 'Date'
              }
            },
            {
              id: 'toDate',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"DATE_RANGE\"',
              field_type: {
                type: 'Date'
              }
            }
          ],
          id: 'MediationUnavailableDate',
          type: 'Complex',
        },
        hidden: false,
        id: 0,
        label: 'Unavailable dates 1',
        value: {
          unavailableDateType: 'DATE_RANGE',
          date: null,
          fromDate: '2025-01-01',
          toDate: '2025-01-03'
        }
      }) as unknown as CaseField);
      fixture.detectChanges();

      const rangeValues = de.queryAll($COMPLEX_PANEL_ALL_VALUES);

      // values will be date type, fromDate and toDate (date hidden)
      expect(rangeValues.length).toEqual(3);

      component.caseField = (({
        field_type: {
          collection_field_type: null,
          complex_fields: [
            {
              id: 'unavailableDateType',
              display_context: 'MANDATORY',
              field_type: {
                type: 'FixedRadioList'
              }
            },
            {
              id: 'date',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"SINGLE_DATE\"',
              field_type: {
                type: 'Date'
              }
            },
            {
              id: 'fromDate',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"DATE_RANGE\"',
              field_type: {
                type: 'Date'
              }
            },
            {
              id: 'toDate',
              display_context: 'MANDATORY',
              show_condition: 'parent.unavailableDatesForMediation.unavailableDateType=\"DATE_RANGE\"',
              field_type: {
                type: 'Date'
              }
            }
          ],
          id: 'MediationUnavailableDate',
          type: 'Complex',
        },
        hidden: false,
        id: 0,
        label: 'Unavailable dates 1',
        value: {
          unavailableDateType: 'SINGLE_DATE',
          date: '2025-01-01',
          fromDate: null,
          toDate: null
        }
      }) as unknown as CaseField);
      fixture.detectChanges();

      const singleValues = de.queryAll($COMPLEX_PANEL_ALL_VALUES);

      // values will be date type and date (fromDate and toDate hidden)
      expect(singleValues.length).toEqual(2);
    })
  });

  describe('when values as object in root field', () => {
    const FIELD_TYPE: FieldType = {
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
          }
        }) as CaseField,
        ({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          }
        }) as CaseField,
        ({
          id: 'AddressPostcode',
          label: 'Post code',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Postcode',
            type: 'Complex',
            complex_fields: [
              ({
                id: 'PostcodeCity',
                label: 'City',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                }
              }) as CaseField,
              ({
                id: 'PostcodeCountry',
                label: 'Country',
                display_context: 'OPTIONAL',
                field_type: {
                  id: 'Text',
                  type: 'Text'
                }
              }) as CaseField
            ]
          }
        }) as CaseField
      ]
    };

    const CASE_FIELD: CaseField = ({
      id: '',
      label: 'Complex Field',
      field_type: FIELD_TYPE,
      display_context: 'OPTIONAL',
      value: {
        AddressLine1: 'Flat 9',
        AddressLine2: '111 East India road',
        AddressPostcode: {
          PostcodeCity: 'London',
          PostcodeCountry: 'UK'
        }
      }
    }) as CaseField;

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule
          ],
          declarations: [
            ReadComplexFieldTableComponent,
            FieldsFilterPipe,
            ReadFieldsFilterPipe,
            // Mocks
            MockRpxTranslatePipe,
            fieldReadComponentMock
          ],
          providers: [
            FieldsUtils,
            ConditionalShowRegistrarService,
            GreyBarService
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldTableComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render a table with a row containing 2 columns for each simple type', () => {
      const values = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_ALL_VALUES);

      expect(values.length).toBe(3);

      const line1 = FIELD_TYPE.complex_fields[LINE_1];
      expect(values[LINE_1].componentInstance.caseField).toEqual({
        id: line1.id,
        label: line1.label,
        display_context: 'OPTIONAL',
        field_type: line1.field_type,
        hidden: false,
        value: CASE_FIELD.value['AddressLine1']
      });

      const line2 = FIELD_TYPE.complex_fields[LINE_2];
      expect(values[LINE_2].componentInstance.caseField).toEqual({
        id: line2.id,
        label: line2.label,
        display_context: 'OPTIONAL',
        field_type: line2.field_type,
        hidden: false,
        value: CASE_FIELD.value['AddressLine2']
      });

      const postcode = FIELD_TYPE.complex_fields[POSTCODE];
      expect(values[POSTCODE].componentInstance.caseField).toEqual({
        id: postcode.id,
        label: postcode.label,
        display_context: 'OPTIONAL',
        field_type: postcode.field_type,
        hidden: false,
        value: CASE_FIELD.value['AddressPostcode']
      });
    });

    it('should NOT render fields with empty value', () => {
      component.caseField = (({
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: {
          AddressLine1: 'Flat 9'
        }
      }) as CaseField);
      fixture.detectChanges();

      const labels = de.queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);

      expect(labels.length).toEqual(1);

      expect(labels[0].nativeElement.textContent).toBe(FIELD_TYPE.complex_fields[LINE_1].label);
    });
  });

});
