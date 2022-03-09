import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadComplexFieldCollectionTableComponent } from './read-complex-field-collection-table.component';
import { Component, DebugElement, Input } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { By } from '@angular/platform-browser';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { PaletteContext } from '../base-field/palette-context.enum';
import { createFieldType, newCaseField, textFieldType } from '../../../fixture';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';

@Component({
  selector: 'ccd-field-read',
  template: ''
})
class MockFieldReadComponent {
  @Input()
  caseField: CaseField;
  @Input()
  context: PaletteContext;
}

@Component({
  selector: 'ccd-read-case-link-field',
  template: '<a href="/v2/case/{{caseField.value.CaseReference}}">' +
    '  <span class="text-16">{{caseField.value.CaseReference}}</span>' +
    '</a>'
})
class MockReadCaseLinkFieldComponent {
  @Input()
  caseField: CaseField;
  @Input()
  context: PaletteContext;
}

describe('ReadComplexFieldCollectionTableComponent', () => {

  const $COMPLEX_PANEL = By.css('div.complex-panel');
  const $COMPLEX_PANEL_TITLE = By.css('dl.complex-panel-title');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS = By.css('div>table>tbody>tr>th>span');
  const $COMPLEX_PANEL_SIMPLE_ROWS_HEADERS_CLICK = By.css('div>table>tbody>tr>th>a');
  const $COMPLEX_PANEL_SIMPLE_ROWS_VALUES = By.css('div>table>tbody>tr>td>div>ccd-field-read');
  const $COMPLEX_PANEL_EXPANDED_ROWS_HEADERS = By.css('div>table>tbody>tr>td>table>tbody>tr>th>span');
  const $COMPLEX_PANEL_EXPANDED_ROWS_VALUES = By.css('div>table>tbody>tr>td>table>tbody>tr>td>ccd-field-read');
  const UNORDERED = '&#9650;';
  const FIRST_COLUMN = 'AddressLine1';
  const SECOND_COLUMN = 'AddressLine2';
  const FOURTH_COLUMN = 'AddressLine4';
  const FIFTH_COLUMN = 'AddressLine3';

  let fixture: ComponentFixture<ReadComplexFieldCollectionTableComponent>;
  let component: ReadComplexFieldCollectionTableComponent;
  let de: DebugElement;

  describe('when values split across children fields', () => {
    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'IAmVeryComplex',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine2', 'Line 2', null, createFieldType('Number', 'Number'), 'OPTIONAL')
          .withValue('111 East India road').build(),
        newCaseField('AddressLine1', 'Line 1', null, textFieldType(), 'OPTIONAL').withValue('Flat 9').build(),
        newCaseField('AddressPostcode', 'Post code', null, createFieldType('Complex', 'Complex'), 'OPTIONAL')
          .withValue('tw45ed').build(),
        newCaseField('AddressLine4', 'Line 4', null, textFieldType(), 'OPTIONAL').withValue('Flat 6').build(),
        newCaseField('AddressLine3', 'Line 3', null, textFieldType(), 'OPTIONAL').withValue('Flat 7').build(),
      ]
    };
    const CASE_FIELD: CaseField = newCaseField('', 'Complex Field', null, FIELD_TYPE_WITH_VALUES, 'OPTIONAL')
      .withValue([
        {
          value: {
            label: 'SomeLabel',
            AddressLine1: 'Flat 9',
            AddressLine2: 222,
            AddressLine3: 333,
            AddressLine4: 555,
            AddressPostcode: { postcode: 'TE45ED' }
          }
        },
        {
          value: {
              label: 'Label 1',
              AddressLine1: 'AAFlat 10',
              AddressLine2: 111,
              AddressLine3: 444,
              AddressLine4: 666,
              AddressPostcode: { postcode: 'TE45ED' }
          }
        }
      ]).withDisplayContextParameter('#TABLE(AddressLine1, AddressLine2)').build();

    const LINE_1 = 0;
    const LINE_2 = 1;
    const LINE_3 = 2;
    const LINE_4 = 3;
    const LINE_5 = 4;
    const LINE_6 = 5;

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
            ReadFieldsFilterPipe,

            // Mock
            MockFieldReadComponent,
            MockReadCaseLinkFieldComponent,
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

    it('should render a table with a row containing 2 columns for each simple type and 3 columns for each row', () => {
      let simpleRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_SIMPLE_ROWS_HEADERS);
      expect(simpleRowsHeaders.length).toBe(2);
      expect(simpleRowsHeaders[LINE_1].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);
      expect(simpleRowsHeaders[LINE_2].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);

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
      expect(component.columnsVerticalLabel['AddressPostcode'].label).toEqual('Post code')
      expect(component.columnsVerticalLabel['AddressPostcode'].type).toEqual('Complex');
      expect(component.columnsVerticalLabel['AddressPostcode'].caseField.id).toEqual('AddressPostcode');
      expect(component.columnsVerticalLabel['AddressPostcode'].caseField.label).toEqual('Post code');
      expect(component.columnsVerticalLabel['AddressPostcode'].caseField.field_type.id).toEqual('Complex');
      expect(component.columnsVerticalLabel['AddressPostcode'].caseField.field_type.type).toEqual('Complex');
      expect(component.columnsVerticalLabel['AddressPostcode'].caseField.value).toEqual({postcode: 'TE45ED'});

      let expandedRowsVerticalHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_EXPANDED_ROWS_HEADERS);
      expect(expandedRowsVerticalHeaders.length).toBe(6);
      // row 1
      expect(expandedRowsVerticalHeaders[LINE_1].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_3].label);
      expect(expandedRowsVerticalHeaders[LINE_2].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_4].label);
      expect(expandedRowsVerticalHeaders[LINE_3].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_5].label);
      // row 2
      expect(expandedRowsVerticalHeaders[LINE_4].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_3].label);
      expect(expandedRowsVerticalHeaders[LINE_5].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_4].label);
      expect(expandedRowsVerticalHeaders[LINE_6].nativeElement.textContent).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_5].label);

      let expandedRowsValues = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_EXPANDED_ROWS_VALUES);
      expect(expandedRowsValues.length).toBe(4);
      // row 1
      expect(expandedRowsValues[0].componentInstance.caseField.value).toEqual(CASE_FIELD.value[0].value[FOURTH_COLUMN]);
      expect(expandedRowsValues[1].componentInstance.caseField.value).toEqual(CASE_FIELD.value[0].value[FIFTH_COLUMN]);
      // row 2
      expect(expandedRowsValues[2].componentInstance.caseField.value).toEqual(CASE_FIELD.value[1].value[FOURTH_COLUMN]);
      expect(expandedRowsValues[3].componentInstance.caseField.value).toEqual(CASE_FIELD.value[1].value[FIFTH_COLUMN]);

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

describe('ReadComplexFieldCollectionTableComponent - nested complex field values', () => {

  const NAME_COLUMN = 'Name';
  const ADDRESS_LINE1_COLUMN = 'AddressLine1';
  const ADDRESS_LINE2_COLUMN = 'AddressLine2';
  const ADDRESS_LINE3_COLUMN = 'AddressLine3';
  const ADDRESS_LINE4_COLUMN = 'AddressLine4';
  const ADDRESS_LINE5_COLUMN = 'AddressLine5';
  const VAT_NUMBER_COLUMN = 'VATNumber';
  const $COMPLEX_PANEL_CASE_LINKS = By.css('ccd-read-case-link-field>a');
  const $COMPLEX_PANEL_CASE_LINK_VALUES = By.css('ccd-read-case-link-field>a>span');

  let fixture: ComponentFixture<ReadComplexFieldCollectionTableComponent>;
  let component: ReadComplexFieldCollectionTableComponent;
  let de: DebugElement;

  describe('when values split across nested children fields', () => {
    const BUSINESS_ADDRESS_FIELD_TYPE: FieldType = {
      id: 'BusinessAddress',
      type: 'Complex',
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine5', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine4', 'Line 3', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine3', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine2', 'Line 3', null, textFieldType(), 'OPTIONAL').build()
      ]
    };

    const CASE_LINK_FIELD_TYPE: FieldType = {
      id: 'CaseLink',
      type: 'Complex',
      complex_fields: [
        newCaseField('CaseReference', 'Case Reference', null, textFieldType(), 'OPTIONAL').withValue('').build()
      ]
    };

    const COMPLEX_FIELD_TYPE: FieldType = {
      id: 'Company',
      type: 'Complex',
      complex_fields: [
        newCaseField('Name', 'Name', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('SomeCaseLink', 'Some caseLink', null, CASE_LINK_FIELD_TYPE, 'OPTIONAL')
          .withValue('{CaseReference: "1568320010666976"}').build(),
        newCaseField('BusinessAddress', 'Business Address', null, BUSINESS_ADDRESS_FIELD_TYPE, 'OPTIONAL')
          .withValue('{AddressLine1: "45 Edric House", AddressLine2: "Page Street"}')
          .build(),
        newCaseField('VATNumber', 'VAT Number', null, textFieldType(), 'OPTIONAL').build(),
      ]
    };

    const COMPANY_DETAILS_CASE_FIELD: CaseField = newCaseField('Company Details', 'Company Details', null, COMPLEX_FIELD_TYPE, 'OPTIONAL')
      .withValue([
        {
          id: '8df48243-bdc6-4ecc-a7ae-9aceef8a387c',
          value: {
            Name: 'Company1',
            SomeCaseLink: {
              CaseReference: '1568320010661111'
            },
            BusinessAddress: {
              AddressLine1: '45 Edric House',
              AddressLine2: 'Page Street',
              AddressLine4: 'Street4',
              AddressLine5: 'Street5',
            },
            VATNumber: 'GB123456789'
          }
        },
        {
          id: 'e4721576-4776-409c-973d-dbd91575893e',
          value: {
            Name: 'Company2',
            SomeCaseLink: {
              CaseReference: '1568320010662222'
            },
            BusinessAddress: {
              AddressLine1: null,
              AddressLine2: '150 Boyson Road',
              AddressLine3: 'Blue door',
              AddressLine4: 'Street6',
              AddressLine5: 'Street7',
            },
            VATNumber: ''
          }
        }
      ]).withDisplayContextParameter('#TABLE(Name)').build();

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
            ReadFieldsFilterPipe,

            // Mock
            MockFieldReadComponent,
            MockReadCaseLinkFieldComponent,
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadComplexFieldCollectionTableComponent);
      component = fixture.componentInstance;

      component.caseField = COMPANY_DETAILS_CASE_FIELD;
      component.context = PaletteContext.TABLE_VIEW;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render all ccd-field-read elements', () => {
      let fieldReadElements = fixture.debugElement.queryAll(By.directive(MockFieldReadComponent));
      let fieldReads = fieldReadElements.map(readElement => readElement.injector.get(MockFieldReadComponent));

      expect(fieldReads).toBeTruthy();
      expect(fieldReads.length).toBe(11);

      expect(fieldReads[0].caseField.id).toEqual(NAME_COLUMN);
      expect(fieldReads[0].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value[NAME_COLUMN]);
      expect(fieldReads[1].caseField.id).toEqual(ADDRESS_LINE1_COLUMN);
      expect(fieldReads[1].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value.BusinessAddress[ADDRESS_LINE1_COLUMN]);
      expect(fieldReads[2].caseField.id).toEqual(ADDRESS_LINE5_COLUMN);
      expect(fieldReads[2].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value.BusinessAddress[ADDRESS_LINE5_COLUMN]);
      expect(fieldReads[3].caseField.id).toEqual(ADDRESS_LINE4_COLUMN);
      expect(fieldReads[3].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value.BusinessAddress[ADDRESS_LINE4_COLUMN]);
      expect(fieldReads[4].caseField.id).toEqual(ADDRESS_LINE2_COLUMN);
      expect(fieldReads[4].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value.BusinessAddress[ADDRESS_LINE2_COLUMN]);
      expect(fieldReads[5].caseField.id).toEqual(VAT_NUMBER_COLUMN);
      expect(fieldReads[5].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[0].value[VAT_NUMBER_COLUMN]);

      expect(fieldReads[6].caseField.id).toEqual(NAME_COLUMN);
      expect(fieldReads[6].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[1].value[NAME_COLUMN]);
      expect(fieldReads[7].caseField.id).toEqual(ADDRESS_LINE5_COLUMN);
      expect(fieldReads[7].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[1].value.BusinessAddress[ADDRESS_LINE5_COLUMN]);
      expect(fieldReads[8].caseField.id).toEqual(ADDRESS_LINE4_COLUMN);
      expect(fieldReads[8].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[1].value.BusinessAddress[ADDRESS_LINE4_COLUMN]);
      expect(fieldReads[9].caseField.id).toEqual(ADDRESS_LINE3_COLUMN);
      expect(fieldReads[9].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[1].value.BusinessAddress[ADDRESS_LINE3_COLUMN]);
      expect(fieldReads[10].caseField.id).toEqual(ADDRESS_LINE2_COLUMN);
      expect(fieldReads[10].caseField.value).toEqual(COMPANY_DETAILS_CASE_FIELD.value[1].value.BusinessAddress[ADDRESS_LINE2_COLUMN]);

    });

    it('should render all case links', () => {
      let caseLinks = de.queryAll($COMPLEX_PANEL_CASE_LINKS);
      expect(caseLinks.length).toBe(2);

      expect(caseLinks[0].properties.href).toEqual('/v2/case/' + COMPANY_DETAILS_CASE_FIELD.value[0].value.SomeCaseLink.CaseReference);
      expect(caseLinks[1].properties.href).toEqual('/v2/case/' + COMPANY_DETAILS_CASE_FIELD.value[1].value.SomeCaseLink.CaseReference);
    });

    it('should render all case link values', () => {
      let caseLinkValues = de.queryAll($COMPLEX_PANEL_CASE_LINK_VALUES);
      expect(caseLinkValues.length).toBe(2);

      expect(caseLinkValues[0].nativeElement.textContent.trim()).toBe(COMPANY_DETAILS_CASE_FIELD.value[0].value.SomeCaseLink.CaseReference);
      expect(caseLinkValues[1].nativeElement.textContent.trim()).toBe(COMPANY_DETAILS_CASE_FIELD.value[1].value.SomeCaseLink.CaseReference);
    });
  });

});
