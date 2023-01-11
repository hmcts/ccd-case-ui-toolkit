import { DebugElement, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { plainToClassFromExist } from 'class-transformer';
import { MockComponent } from 'ng2-mock-component';

import { ConditionalShowModule } from '../../../directives/conditional-show/conditional-show.module';
import { CaseField, FieldType } from '../../../domain/definition';
import { FieldsFilterPipe } from '../../../pipes/complex/fields-filter.pipe';
import { FormValidatorsService } from '../../../services/form/form-validators.service';
import { IsCompoundPipe, IsReadOnlyPipe, PaletteUtilsModule } from '../utils';
import { WriteComplexFieldComponent } from './write-complex-field.component';

import createSpyObj = jasmine.createSpyObj;

const buildFields = (component: WriteComplexFieldComponent) => {
  const fields = component.caseField.field_type.complex_fields;
  for (const field of fields) {
    component.buildField(field);
  }
};

describe('WriteComplexFieldComponent', () => {
  const $COMPLEX_PANEL = By.css('.form-group');
  const $COMPLEX_PANEL_TITLE = By.css('h2');
  const $COMPLEX_PANEL_VALUES = By.css('ccd-field-write');

  const FieldWriteComponent = MockComponent({
    selector: 'ccd-field-write',
    inputs: ['caseField', 'caseFields', 'formGroup', 'idPrefix', 'isExpanded', 'parent', 'isInSearchBlock']
  });

  const FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField', 'caseFields', 'formGroup', 'withLabel']
  });

  @Pipe({name: 'ccdIsReadOnly'})
  class MockIsReadOnlyPipe implements PipeTransform {
    public transform(field: CaseField): boolean {
      if (!field || !field.display_context) {
        return false;
      }
      return field.display_context.toUpperCase() === 'READONLY';
    }
  }

  let fixture: ComponentFixture<WriteComplexFieldComponent>;
  let component: WriteComplexFieldComponent;
  let de: DebugElement;
  let formValidatorService: jasmine.SpyObj<FormValidatorsService>;

  function prepareTestBed(): void {
    TestBed
      .configureTestingModule({
        imports: [
          PaletteUtilsModule,
          ConditionalShowModule
        ],
        declarations: [
          WriteComplexFieldComponent,
          FieldsFilterPipe,

          // Mock
          FieldWriteComponent,
          FieldReadComponent,
          MockIsReadOnlyPipe
        ],
        providers: [
          IsCompoundPipe,
          IsReadOnlyPipe,
          {provide: FormValidatorsService, useValue: formValidatorService}
        ]
      })
      .compileComponents();
  }

  describe('when values split across children fields', () => {
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
          }
        }) as CaseField
      ]
    };

    const FIELD_ID = 'AComplexField';
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'Complex Field',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_WITH_VALUES
    }) as CaseField;

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);

      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.formGroup = FORM_GROUP;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      component.ngOnInit();
      fixture.detectChanges();
    }));

    it('should render a form group with a header for the complex type', () => {
      const panelTitle = de
        .query($COMPLEX_PANEL)
        .query($COMPLEX_PANEL_TITLE);

      expect(panelTitle).toBeTruthy();
      expect(panelTitle.nativeElement.textContent).toBe(CASE_FIELD.label + ' (Optional)');
    });

    it('should render a field write component for each field in the complex type', () => {
      const simpleRowsHeaders = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_VALUES);

      expect(simpleRowsHeaders.length).toBe(3);
      expect(simpleRowsHeaders[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(simpleRowsHeaders[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);
      expect(simpleRowsHeaders[POSTCODE].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[POSTCODE].label);
    });

    it('should render fields with empty value', () => {
      component.caseField = (({
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE_WITH_MISSING_VALUE
      }) as CaseField);
      component.ngOnInit();
      fixture.detectChanges();

      const labels = de.queryAll($COMPLEX_PANEL_VALUES);

      expect(labels.length).toEqual(2);

      expect(labels[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_1].label);
      expect(labels[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE_WITH_VALUES.complex_fields[LINE_2].label);
    });

    it('should return control if it exists in the formGroup', () => {
      // component.caseField is CASE_FIELD to start with.
      // Try re-building the first field and ensure it's appropriately handled.
      const FIRST_FIELD = CASE_FIELD.field_type.complex_fields[0];
      // Spy on the addControl method.
      const addControlSpy = spyOn(component.complexGroup, 'addControl').and.callThrough();
      const firstFieldControl = component.complexGroup.get(FIRST_FIELD.id);
      expect(firstFieldControl).toBeDefined();
      expect(firstFieldControl['caseField']).toEqual(plainToClassFromExist(new CaseField(), FIRST_FIELD));
      const result = component.buildField(FIRST_FIELD);
      expect(result).toEqual(FIRST_FIELD);
      // Make sure we didn't call the addControl method.
      expect(addControlSpy).not.toHaveBeenCalled();
      // And also make sure we still have the control in place.
      const firstFieldControlAgain = component.complexGroup.get(FIRST_FIELD.id);
      expect(firstFieldControlAgain).toBe(firstFieldControl);
      expect(firstFieldControlAgain['caseField']).toEqual(firstFieldControl['caseField']);
    });

    // TODO: Ensure there is an equivalent test for AbstractFormFieldComponent.register.
    it('should add control if it does not exist in the formGroup', () => {
      // component.caseField is CASE_FIELD to start with.
      // Try re-building the first field and ensure it's appropriately handled.
      const NEW_FIELD = ({
        id: 'AddressLine3',
        label: 'Line 3',
        display_context: 'OPTIONAL',
        field_type: { id: 'Text', type: 'Text' }
      }) as CaseField;
      // Spy on the addControl method, which should NOT be called.
      const addControlSpy = spyOn(component.complexGroup, 'addControl').and.callThrough();
      const newFieldControl = component.complexGroup.get(NEW_FIELD.id);
      expect(newFieldControl).toBeNull();
      const result = component.buildField(NEW_FIELD);
      expect(result).toEqual(NEW_FIELD);
      // And also make sure we still have the control in place.
      const newFieldControlAgain = component.complexGroup.get(NEW_FIELD.id);
      expect(newFieldControlAgain).toBeDefined();
      expect(newFieldControlAgain['caseField']).toEqual(NEW_FIELD);
      // Make sure we DID call the addControl method with this newly added control.
      expect(addControlSpy).toHaveBeenCalledWith(NEW_FIELD.id, newFieldControlAgain);
    });
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

    const FIELD_ID = 'SomeFieldId';
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
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
    const FORM_GROUP: FormGroup = new FormGroup({});

    const LINE_1 = 0;
    const LINE_2 = 1;
    const POSTCODE = 2;

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);

      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.formGroup = FORM_GROUP;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      component.ngOnInit();
      fixture.detectChanges();
    }));

    it('should render a table with a row containing 2 columns for each simple type', () => {
      const values = de
        .query($COMPLEX_PANEL)
        .queryAll($COMPLEX_PANEL_VALUES);

      expect(values.length).toBe(3);

      const line1 = FIELD_TYPE.complex_fields[LINE_1];
      expect(values[LINE_1].componentInstance.caseField).toEqual(plainToClassFromExist(new CaseField(), {
        id: line1.id,
        label: line1.label,
        display_context: 'OPTIONAL',
        field_type: line1.field_type,
        value: CASE_FIELD.value['AddressLine1']
      }));

      const line2 = FIELD_TYPE.complex_fields[LINE_2];
      expect(values[LINE_2].componentInstance.caseField).toEqual(plainToClassFromExist(new CaseField(), {
        id: line2.id,
        label: line2.label,
        display_context: 'OPTIONAL',
        field_type: line2.field_type,
        value: CASE_FIELD.value['AddressLine2']
      }));

      const postcode = FIELD_TYPE.complex_fields[POSTCODE];
      expect(values[POSTCODE].componentInstance.caseField).toEqual(plainToClassFromExist(new CaseField(), {
        id: postcode.id,
        label: postcode.label,
        display_context: 'OPTIONAL',
        field_type: postcode.field_type,
        value: CASE_FIELD.value['AddressPostcode']
      }));
    });

    it('should render fields with empty value', () => {
      component.caseField = (( ({
        id: 'x',
        label: 'x',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: {
          AddressLine1: 'Flat 9'
        }
      }) as CaseField) as CaseField);
      fixture.detectChanges();

      const labels = de.queryAll($COMPLEX_PANEL_VALUES);

      expect(labels.length).toEqual(3);

      expect(labels[LINE_1].componentInstance.caseField.label).toBe(FIELD_TYPE.complex_fields[LINE_1].label);
      expect(labels[LINE_2].componentInstance.caseField.label).toBe(FIELD_TYPE.complex_fields[LINE_2].label);
    });

    it('should render label if set to true', () => {
      component.caseField = (({
        id: 'renderLabelId',
        label: 'Test Label',
        display_context: 'OPTIONAL',
        field_type: FIELD_TYPE,
        value: {
          AddressLine1: 'Flat 9'
        }
      }) as CaseField);
      component.renderLabel = true;
      fixture.detectChanges();
      expect(component.caseField.label).toBe('Test Label');
    });
  });

  describe('when display_context of AddressLine1 is MANDATORY', () => {
    const ADDRESS_LINE_1: CaseField = ({
      id: 'AddressLine1',
      label: 'Line 1',
      display_context: 'MANDATORY',
      field_type: { id: 'TextMax150', type: 'Text' },
      value: ''
    }) as CaseField;
    const ADDRESS_LINE_2: CaseField = ({
      id: 'AddressLine2',
      label: 'Line 2',
      field_type: { id: 'Text', type: 'Text' },
      value: '111 East India road'
    }) as CaseField;
    const BROKEN_ADDRESS_LINE_1: CaseField = ({
      id: 'AddressLine1',
      label: 'Line 1',
      display_context: 'MANDATORY',
      field_type: { id: '"TextMax150"', type: 'Text' },
      value: ''
    }) as CaseField;
    const ADDRESS_TYPE: FieldType = {
      id: 'AddressUK',
      type: 'Complex',
    };

    const FIELD_TYPE_WITH_VALUES: FieldType = {
      id: 'TextMax150',
      type: 'Text'
    };

    const FIELD_ID = 'AComplexField';
    const CASE_FIELD_M: CaseField =  ({
      id: FIELD_ID,
      label: 'Complex Field',
      display_context: 'MANDATORY',
      field_type: FIELD_TYPE_WITH_VALUES
    }) as CaseField;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD_M;
      component.formGroup = FORM_GROUP;
      component.ignoreMandatory = true;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should not add validators when case field is not AddressLine1 and TextMax150', () => {
      formValidatorService.addValidators.calls.reset();
      component.caseField = (({
        id: 'anotherComplexField',
        label: 'Complex Field',
        display_context: 'MANDATORY',
        field_type: {
          ...ADDRESS_TYPE,
          complex_fields: [ BROKEN_ADDRESS_LINE_1, ADDRESS_LINE_2 ]
        }
      }) as CaseField);
      component.ngOnInit();
      buildFields(component);
      fixture.detectChanges();

      // Should have been called for the group overall, but not for either of the complex_fields.
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(1);
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(component.caseField, jasmine.any(FormGroup));
    });

    it('should add validators when case field is AddressLine1 and TextMax150', () => {
      formValidatorService.addValidators.calls.reset();
      component.caseField = (({
        id: 'anotherComplexField',
        label: 'Complex Field',
        display_context: 'MANDATORY',
        field_type: {
          ...ADDRESS_TYPE,
          complex_fields: [ ADDRESS_LINE_1, ADDRESS_LINE_2 ]
        }
      }) as CaseField);
      component.ngOnInit();
      buildFields(component);
      fixture.detectChanges();

      // Should have been called for the group overall, but not for either of the complex_fields.
      // expect(formValidatorService.addValidators).toHaveBeenCalledTimes(2);
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(component.caseField, jasmine.any(FormGroup));
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(ADDRESS_LINE_1, jasmine.any(FormControl));
    });

    it('should not add validators when case field is AddressLine1 but NOT TextMax150', () => {
      formValidatorService.addValidators.calls.reset();
      component.caseField = (({
        id: 'anotherComplexField',
        label: 'Complex Field',
        display_context: 'MANDATORY',
        field_type: {
          ...ADDRESS_TYPE,
          complex_fields: [ ({
            id: 'AddressLine1',
            label: 'Line 1',
            field_type: {
              id: 'TextMax151', // Should fall down here.
              type: 'Text'
            },
            value: ''
          }) as CaseField, ADDRESS_LINE_2 ]
        }
      }) as CaseField);
      component.ngOnInit();
      buildFields(component);
      fixture.detectChanges();

      // Should have been called for the group overall, but not for either of the complex_fields.
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(1);
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(component.caseField, jasmine.any(FormGroup));
    });

    it('should not add validators when case field is NOT AddressLine1', () => {
      formValidatorService.addValidators.calls.reset();
      component.caseField = (({
        id: 'anotherComplexField',
        label: 'Complex Field',
        display_context: 'MANDATORY',
        field_type: {
          ...ADDRESS_TYPE,
          complex_fields: [ ({
            id: 'AddressLine3', // Should fall down here.
            label: 'Line 1',
            field_type: {
              id: 'TextMax150',
              type: 'Text'
            },
            value: ''
          }) as CaseField, ADDRESS_LINE_2 ]
        }
      }) as CaseField);
      component.ngOnInit();
      buildFields(component);
      fixture.detectChanges();

      // Should have been called for the group overall, but not for either of the complex_fields.
      expect(formValidatorService.addValidators).toHaveBeenCalledTimes(1);
      expect(formValidatorService.addValidators).toHaveBeenCalledWith(component.caseField, jasmine.any(FormGroup));
    });
  });

  describe('inheritance of "retain_hidden_value" value from Address parent type', () => {
    const ADDRESS_LINE_1: CaseField = ({
      id: 'AddressLine1',
      label: 'Line 1',
      field_type: {id: 'TextMax150', type: 'Text'},
      value: ''
    }) as CaseField;
    const ADDRESS_LINE_2: CaseField = ({
      id: 'AddressLine2',
      label: 'Line 2',
      field_type: {id: 'Text', type: 'Text'},
      value: '111 East India road'
    }) as CaseField;
    const ADDRESS_TYPE: FieldType = {
      id: 'AddressUK',
      type: 'Complex'
    };

    const FIELD_ID = 'AnAddressField';
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'Address Field',
      field_type: {
        ...ADDRESS_TYPE,
        complex_fields: [ADDRESS_LINE_1, ADDRESS_LINE_2]
      },
      retain_hidden_value: true
    }) as CaseField;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should set retain_hidden_value to true for all sub-fields that are part of an Address-type field', () => {
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.caseField.field_type.complex_fields.length).toEqual(2);
      expect(component.caseField.field_type.complex_fields[0].retain_hidden_value).toEqual(true);
      expect(component.caseField.field_type.complex_fields[1].retain_hidden_value).toEqual(true);
    });
  });

  describe('inheritance of "retain_hidden_value" value from Complex parent type', () => {
    const ADDRESS_LINE_1: CaseField = ({
      id: 'AddressLine1',
      label: 'Line 1',
      field_type: {id: 'TextMax150', type: 'Text'},
      value: ''
    }) as CaseField;
    const ADDRESS_LINE_2: CaseField = ({
      id: 'AddressLine2',
      label: 'Line 2',
      field_type: {id: 'Text', type: 'Text'},
      value: '111 East India road'
    }) as CaseField;
    const COMPLEX_TYPE: FieldType = {
      id: 'OtherAddress',
      type: 'Complex'
    };

    const FIELD_ID = 'AnAddressField';
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'Address Field',
      field_type: {
        ...COMPLEX_TYPE,
        complex_fields: [ADDRESS_LINE_1, ADDRESS_LINE_2]
      },
      retain_hidden_value: true
    }) as CaseField;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should NOT set retain_hidden_value for all sub-fields that are part of a Complex field', () => {
      component.ngOnInit();
      fixture.detectChanges();

      expect(component.caseField.field_type.complex_fields.length).toEqual(2);
      expect(component.caseField.field_type.complex_fields[0].retain_hidden_value).toBeUndefined();
      expect(component.caseField.field_type.complex_fields[1].retain_hidden_value).toBeUndefined();
    });
  });

  describe('Editable Complex type containing a read-only Collection field', () => {
    const COLLECTION_TYPE: FieldType = {
      id: 'CollectionFieldType',
      type: 'Collection',
      collection_field_type: {
        id: 'Text',
        type: 'Text'
      }
    };
    const COLLECTION_FIELD: CaseField = ({
      id: 'ACollection',
      label: 'Collection of text fields',
      field_type: COLLECTION_TYPE,
      display_context: 'READONLY'
    }) as CaseField;
    const COMPLEX_TYPE: FieldType = {
      id: 'ComplexFieldWithCollection',
      type: 'Complex'
    };
    const CASE_FIELD: CaseField = ({
      id: 'AComplexField',
      label: 'Complex field containing a Collection field',
      field_type: {
        ...COMPLEX_TYPE,
        complex_fields: [COLLECTION_FIELD]
      },
      display_context: 'COMPLEX'
    }) as CaseField;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render the Collection field as read-only', () => {
      const readOnlyCollectionField = de.query(By.css('ccd-field-read'));
      expect(readOnlyCollectionField).toBeTruthy();
      // Confirm that the field is the expected Collection type and is read-only
      const field = readOnlyCollectionField.componentInstance;
      expect(field.caseField.field_type instanceof FieldType).toBeTruthy();
      expect(field.caseField.field_type.id).toEqual(COLLECTION_TYPE.id);
      expect(field.caseField.field_type.type).toEqual(COLLECTION_TYPE.type);
      expect(field.caseField.display_context).toEqual('READONLY');
    });
  });

  describe('Editable Complex type containing a writable Collection field', () => {
    const COLLECTION_TYPE: FieldType = {
      id: 'CollectionFieldType',
      type: 'Collection',
      collection_field_type: {
        id: 'Text',
        type: 'Text'
      }
    };
    const COLLECTION_FIELD: CaseField = ({
      id: 'ACollection',
      label: 'Collection of text fields',
      field_type: COLLECTION_TYPE
    }) as CaseField;
    const COMPLEX_TYPE: FieldType = {
      id: 'ComplexFieldWithCollection',
      type: 'Complex'
    };
    const CASE_FIELD: CaseField = ({
      id: 'AComplexField',
      label: 'Complex field containing a Collection field',
      field_type: {
        ...COMPLEX_TYPE,
        complex_fields: [COLLECTION_FIELD]
      },
      display_context: 'COMPLEX'
    }) as CaseField;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      formValidatorService = createSpyObj<FormValidatorsService>('formValidatorService', ['addValidators']);
      prepareTestBed();

      fixture = TestBed.createComponent(WriteComplexFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render the Collection field as writable', () => {
      const writableCollectionField = de.query(By.css('ccd-field-write'));
      expect(writableCollectionField).toBeTruthy();
      // Confirm that the field is the expected Collection type
      const field = writableCollectionField.componentInstance;
      expect(field.caseField.field_type instanceof FieldType).toBeTruthy();
      expect(field.caseField.field_type.id).toEqual(COLLECTION_TYPE.id);
      expect(field.caseField.field_type.type).toEqual(COLLECTION_TYPE.type);
    });
  });
});
