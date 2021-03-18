import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField, FieldType } from '../../../domain/definition';
import { PaletteContext } from '../base-field/palette-context.enum';
import { PaletteUtilsModule } from '../utils/utils.module';
import { FieldsFilterPipe } from './fields-filter.pipe';
import { ReadComplexFieldComponent } from './read-complex-field.component';

describe('ReadComplexFieldComponent', () => {

  let ReadComplexFieldRawComponent;
  let ReadComplexFieldTableComponent;
  let ReadComplexFieldNewTableComponent;

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

      beforeEach(async(() => {

        ReadComplexFieldRawComponent = MockComponent({
          selector: 'ccd-read-complex-field-raw',
          inputs: ['caseField', 'context']
        });

        ReadComplexFieldTableComponent = MockComponent({
          selector: 'ccd-read-complex-field-table',
          inputs: ['caseField', 'caseFields', 'context']
        });

        ReadComplexFieldNewTableComponent = MockComponent({
          selector: 'ccd-read-complex-field-collection-table',
          inputs: ['caseField', 'context']
        });

        TestBed
          .configureTestingModule({
            imports: [
              PaletteUtilsModule,
              ConditionalShowModule
            ],
            declarations: [
              ReadComplexFieldComponent,
              FieldsFilterPipe,

              // Mock
              ReadComplexFieldRawComponent,
              ReadComplexFieldTableComponent,
              ReadComplexFieldNewTableComponent,
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
      const caseField_dsp: CaseField = new CaseField();
      const FORM_GROUP: FormGroup = new FormGroup({});

      const expectCollectionTable = () => {
        expect(de.queryAll($COMPLEX_AS_RAW).length).toEqual(0);
        expect(de.queryAll($COMPLEX_AS_TABLE).length).toEqual(0);
        expect(de.query($COMPLEX_AS_COLLECTION_TABLE)).toBeTruthy();
      };
      const expectInputs = (componentInstance, expectedContext) => {
        expect(componentInstance.caseField).toBe(caseField_dsp);
        expect(componentInstance.context).toBe(expectedContext);
      };

      caseField_dsp.display_context_parameter = '#TABLE(AddressLine1, AddressLine2)';

      beforeEach(async(() => {

        ReadComplexFieldRawComponent = MockComponent({
          selector: 'ccd-read-complex-field-raw',
          inputs: ['caseField', 'context']
        });

        ReadComplexFieldTableComponent = MockComponent({
          selector: 'ccd-read-complex-field-table',
          inputs: ['caseField', 'caseFields', 'context']
        });

        ReadComplexFieldNewTableComponent = MockComponent({
          selector: 'ccd-read-complex-field-collection-table',
          inputs: ['caseField', 'context']
        });

        TestBed
          .configureTestingModule({
            imports: [
              PaletteUtilsModule,
              ConditionalShowModule
            ],
            declarations: [
              ReadComplexFieldComponent,
              FieldsFilterPipe,

              // Mock
              ReadComplexFieldRawComponent,
              ReadComplexFieldTableComponent,
              ReadComplexFieldNewTableComponent,
            ],
            providers: []
          })
          .compileComponents();

        fixture = TestBed.createComponent(ReadComplexFieldComponent);
        component = fixture.componentInstance;
        component.caseField = caseField_dsp;
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
        <CaseField>({
          id: 'AddressLine1',
          label: 'Line 1',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: 'Flat 9'
        }),
        <CaseField>({
          id: 'AddressLine2',
          label: 'Line 2',
          display_context: 'OPTIONAL',
          field_type: {
            id: 'Text',
            type: 'Text'
          },
          value: '111 East India road'
        })
      ]
    };

    const FIELD_ID = 'AComplexField';
    const VALUE = {
      'AddressLine1': '1 West',
      'AddressLine2': 'South'
    };
    const CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES,
      value: VALUE,

      isDynamic: function () {}
    });

    let fixture: ComponentFixture<ReadComplexFieldComponent>;
    let component: ReadComplexFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {

      ReadComplexFieldRawComponent = MockComponent({
        selector: 'ccd-read-complex-field-raw',
        inputs: ['caseField', 'context']
      });

      ReadComplexFieldTableComponent = MockComponent({
        selector: 'ccd-read-complex-field-table',
        inputs: ['caseField', 'caseFields', 'context']
      });

      ReadComplexFieldNewTableComponent = MockComponent({
        selector: 'ccd-read-complex-field-collection-table',
        inputs: ['caseField', 'context']
      });

      TestBed
        .configureTestingModule({
          imports: [
            PaletteUtilsModule,
            ConditionalShowModule
          ],
          declarations: [
            ReadComplexFieldComponent,
            FieldsFilterPipe,

            // Mock
            ReadComplexFieldRawComponent,
            ReadComplexFieldTableComponent,
            ReadComplexFieldNewTableComponent,
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

    fit('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });

  });
});
