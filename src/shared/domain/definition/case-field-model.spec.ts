import { CaseField } from './case-field.model';
import { async } from '@angular/core/testing';
import { FieldType } from './field-type.model';

describe('CaseField', () => {

  let component: CaseField;
  const VALUE: any = {
    value: {code: 'Code1', label: 'Label 1'},
    list_items: [
      {code: 'Code1', label: 'Label 1'},
      {code: 'Code2', label: 'Label 2'}
    ]
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
    expect(component.value).toBe(null);
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
  it ( 'should be able to extract display format from list of display context params ', () => {
    component.display_context_parameter = 'foo, bar, #DATETIMEDISPLAY(wibble), thud '
    expect(component.dateTimeDisplayFormat).toBe('wibble');
  })
  it ('should be able to extract display format from a single display context param', () => {
    component.display_context_parameter = '#DATETIMEDISPLAY(DDMMYYHHMMSS)';
    expect(component.dateTimeDisplayFormat).toBe('DDMMYYHHMMSS');
  })
  it ('should be able to extract the first param where there are more than one', () => {
    component.display_context_parameter = 'fish, cheese, steak, #DATETIMEDISPLAY(GRAPES), bananas, #DATETIMEDISPLAY(CHOCOLATE)';
    expect(component.dateTimeDisplayFormat).toBe('GRAPES');
  })

  it ('should be return null for null/undef/empty display context parameterm', () => {
    component.display_context_parameter = null;
    expect(component.dateTimeDisplayFormat).toBeNull();
    component.display_context_parameter = undefined;
    expect(component.dateTimeDisplayFormat).toBeNull();
    component.display_context_parameter = '';
    expect(component.dateTimeDisplayFormat).toBeNull();
  })
  it ('should handle empty brackets', () => {
    component.display_context_parameter = '#DATETIMEDISPLAY()'
    expect(component.dateTimeDisplayFormat).toBeNull();
  })

});
