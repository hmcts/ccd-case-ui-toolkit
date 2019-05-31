import { CaseField } from './case-field.model';
import { async } from '@angular/core/testing';
import { FieldType } from './field-type.model';

describe('CaseField', () => {

  let component: CaseField;
  const VALUE: any = {
    value: {code: 'Code1', label: 'Label 1'}, list_items: [{code: 'Code1', label: 'Label 1'},
      {code: 'Code2', label: 'Label 2'}]
  };
  beforeEach(async(() => {
    component = new CaseField();
  }));

  it('should be able to retrive right values from the accessors menthods when FieldType is DynamicLists', () => {

    let fieldType: FieldType = new FieldType();
    fieldType.type = 'DynamicList'
    component.field_type = fieldType;
    expect(component.value).toBeUndefined();
    expect(component.list_items).toEqual([]);
    component.value = 'Ali'
    expect(component.value).toBe('Ali');
    component.value = VALUE;
    expect(component.value).toBe('Code1');
    expect(component.list_items).toEqual([{code: 'Code1', label: 'Label 1'}, {code: 'Code2', label: 'Label 2'}]);
  });

  it('should be able to retrive right values from the accessors menthods when FieldType is Text', () => {
    let fieldType: FieldType = new FieldType();
    fieldType.type = 'Text'
    component.field_type = fieldType;
    expect(component.value).toBeUndefined();
    expect(component.list_items).toBeUndefined();
    component.value = 'Ali'

    expect(component.value).toBe('Ali');
    component.value = VALUE;
    expect(component.value).toBe(VALUE);
    expect(component.list_items).toBeUndefined();
  });

  it('should be able to test if the field is readonly', () => {
    expect(component.isReadonly()).toBe(false);
    component.display_context = null
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'Mandatory';
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'Optional';
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'REAdOnlY';
    expect(component.isReadonly()).toBe(true);
  });

});
