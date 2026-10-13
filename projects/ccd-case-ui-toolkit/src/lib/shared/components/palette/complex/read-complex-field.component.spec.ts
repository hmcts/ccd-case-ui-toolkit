import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField, FieldType } from '../../../domain/definition';
import { ReadFieldsFilterPipe } from '../../../pipes/complex/ccd-read-fields-filter.pipe';
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
    /* tslint:disable-next-line */
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
    /* tslint:disable-next-line */
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

  describe('caseFieldSubfieldCode projection', () => {
    let fixtures: ComponentFixture<ReadComplexFieldComponent>[];

    function createSimpleField(id: string, label: string, type: FieldType['type']): CaseField {
      const field = new CaseField();
      field.id = id;
      field.label = label;
      field.display_context = 'OPTIONAL';
      field.field_type = new FieldType();
      field.field_type.id = type;
      field.field_type.type = type;
      field.field_type.complex_fields = [];
      return field;
    }

    function createComplexField(
      id: string,
      label: string,
      children: CaseField[],
      value: object,
      caseFieldSubfieldCode?: string
    ): CaseField {
      const field = new CaseField();
      field.id = id;
      field.label = label;
      field.display_context = 'READONLY';
      field.field_type = new FieldType();
      field.field_type.id = id;
      field.field_type.type = 'Complex';
      field.field_type.complex_fields = children;
      field.value = value;
      if (caseFieldSubfieldCode !== undefined) {
        field.caseFieldSubfieldCode = caseFieldSubfieldCode;
      }
      return field;
    }

    function renderCaseField(caseField: CaseField): CaseField {
      const fixture = TestBed.createComponent(ReadComplexFieldComponent);
      fixtures.push(fixture);
      fixture.componentInstance.caseField = caseField;
      fixture.detectChanges();

      return fixture.debugElement.query(By.css('ccd-read-complex-field-table')).componentInstance.caseField;
    }

    beforeEach(waitForAsync(() => {
      fixtures = [];
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
    }));

    afterEach(() => fixtures.forEach((fixture) => fixture.destroy()));

    it('passes only the selected direct subfield to the read-only renderer without pruning shared metadata', () => {
      const name = createSimpleField('Name', 'Applicant name', 'Text');
      const address = createSimpleField('Address', 'Address', 'Text');
      const value = { Name: 'A. Applicant', Address: '10 Sample Street' };
      const caseField = createComplexField('Applicant', 'Applicant', [name, address], value, 'Name');

      const projectedField = renderCaseField(caseField);

      expect(projectedField).not.toBe(caseField);
      expect(projectedField.field_type.complex_fields.map((field) => field.id)).toEqual(['Name']);
      expect(projectedField.field_type.complex_fields[0].label).toBe('Applicant name');
      expect(projectedField.field_type.complex_fields[0].field_type.type).toBe('Text');
      expect(projectedField.value).toBe(value);
      const displayedFields = new ReadFieldsFilterPipe().transform(projectedField, true);
      expect(displayedFields.map((field) => field.id)).toEqual(['Name']);
      expect(displayedFields[0].value).toBe('A. Applicant');
      expect(caseField.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Address']);
    });

    it('passes only the selected leaf for a nested subfield path', () => {
      const postcode = createSimpleField('Postcode', 'Postcode', 'Postcode');
      const addressLine = createSimpleField('AddressLine1', 'Address line 1', 'Text');
      const addressValue = { Postcode: 'SW1A 1AA', AddressLine1: '10 Sample Street' };
      const address = createComplexField('Address', 'Address', [postcode, addressLine], addressValue);
      const name = createSimpleField('Name', 'Applicant name', 'Text');
      const caseField = createComplexField(
        'Applicant',
        'Applicant',
        [name, address],
        { Name: 'A. Applicant', Address: addressValue },
        'Address.Postcode'
      );

      const projectedField = renderCaseField(caseField);
      const projectedAddress = projectedField.field_type.complex_fields[0];

      expect(projectedField.field_type.complex_fields.map((field) => field.id)).toEqual(['Address']);
      expect(projectedAddress.field_type.complex_fields.map((field) => field.id)).toEqual(['Postcode']);
      expect(projectedAddress.field_type.complex_fields[0].label).toBe('Postcode');
      expect(projectedAddress.field_type.complex_fields[0].field_type.type).toBe('Postcode');
      const displayedAddress = new ReadFieldsFilterPipe().transform(projectedField, true)[0];
      const displayedPostcode = new ReadFieldsFilterPipe().transform(displayedAddress, true)[0];
      expect(displayedPostcode.id).toBe('Postcode');
      expect(displayedPostcode.value).toBe('SW1A 1AA');
      expect(caseField.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Address']);
      expect(address.field_type.complex_fields.map((field) => field.id)).toEqual(['Postcode', 'AddressLine1']);
    });

    it('accepts a path prefixed by the root field id without treating the prefix as a child', () => {
      const postcode = createSimpleField('Postcode', 'Postcode', 'Postcode');
      const address = createComplexField('Address', 'Address', [postcode], { Postcode: 'SW1A 1AA' });
      const caseField = createComplexField(
        'Applicant',
        'Applicant',
        [address],
        { Address: { Postcode: 'SW1A 1AA' } },
        'applicant.Address.Postcode'
      );

      const projectedField = renderCaseField(caseField);

      expect(projectedField.field_type.complex_fields[0].id).toBe('Address');
      expect(projectedField.field_type.complex_fields[0].field_type.complex_fields.map((field) => field.id))
        .toEqual(['Postcode']);
    });

    it('keeps the full complex field when ListElementCode is blank', () => {
      const caseField = createComplexField(
        'Applicant',
        'Applicant',
        [createSimpleField('Name', 'Applicant name', 'Text'), createSimpleField('Address', 'Address', 'Text')],
        { Name: 'A. Applicant', Address: '10 Sample Street' },
        ''
      );

      const projectedField = renderCaseField(caseField);

      expect(projectedField).toBe(caseField);
      expect(projectedField.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Address']);
    });

    it('keeps the full complex field when the ListElementCode property is absent', () => {
      const caseField = createComplexField(
        'Applicant',
        'Applicant',
        [createSimpleField('Name', 'Applicant name', 'Text'), createSimpleField('Address', 'Address', 'Text')],
        { Name: 'A. Applicant', Address: '10 Sample Street' }
      );

      const projectedField = renderCaseField(caseField);

      expect(projectedField).toBe(caseField);
      expect(projectedField.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Address']);
    });

    it('does not prune the root field when a requested path cannot be resolved', () => {
      const children = [createSimpleField('Name', 'Applicant name', 'Text')];
      const caseField = createComplexField('Applicant', 'Applicant', children, { Name: 'A. Applicant' }, 'Unknown');

      const projectedField = renderCaseField(caseField);

      expect(projectedField).toBe(caseField);
      expect(projectedField.field_type.complex_fields).toBe(children);
    });

    it('does not resolve a subfield through a collection child', () => {
      const documentType = createSimpleField('DocumentType', 'Document type', 'Text');
      const documents = new CaseField();
      documents.id = 'Documents';
      documents.label = 'Documents';
      documents.display_context = 'OPTIONAL';
      documents.field_type = new FieldType();
      documents.field_type.id = 'Documents';
      documents.field_type.type = 'Collection';
      documents.field_type.collection_field_type = new FieldType();
      documents.field_type.collection_field_type.id = 'Document';
      documents.field_type.collection_field_type.type = 'Complex';
      documents.field_type.collection_field_type.complex_fields = [documentType];

      const caseField = createComplexField(
        'CaseDetails',
        'Case details',
        [documents],
        { Documents: [{ DocumentType: 'Letter' }] },
        'Documents.DocumentType'
      );

      const projectedField = renderCaseField(caseField);

      expect(projectedField).toBe(caseField);
      expect(projectedField.field_type.complex_fields.map((field) => field.id)).toEqual(['Documents']);
    });

    it('keeps two rows for the same root field independently projected to different subfields', () => {
      const createSchoolRow = (path: string) => createComplexField(
        'MySchool',
        'My School',
        [
          createSimpleField('Name', 'School name', 'Text'),
          createSimpleField('Number', 'School number', 'Number'),
        ],
        { Name: 'Sample Community School', Number: 24680 },
        path
      );
      const nameRow = createSchoolRow('Name');
      const numberRow = createSchoolRow('Number');

      const renderedNameRow = renderCaseField(nameRow);
      const renderedNumberRow = renderCaseField(numberRow);

      expect(renderedNameRow.field_type.complex_fields.map((field) => field.id)).toEqual(['Name']);
      expect(renderedNumberRow.field_type.complex_fields.map((field) => field.id)).toEqual(['Number']);
      expect(nameRow.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Number']);
      expect(numberRow.field_type.complex_fields.map((field) => field.id)).toEqual(['Name', 'Number']);
    });
  });
});
