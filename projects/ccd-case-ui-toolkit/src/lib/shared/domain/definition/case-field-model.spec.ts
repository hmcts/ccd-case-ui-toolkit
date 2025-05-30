import { waitForAsync } from '@angular/core/testing';
import { CaseField } from './case-field.model';
import { FieldType } from './field-type.model';

describe('CaseField', () => {
  let component: CaseField;
  const VALUE: any = {
    value: {code: 'Code1', label: 'Label 1'}, list_items: [{code: 'Code1', label: 'Label 1'},
      {code: 'Code2', label: 'Label 2'}]
  };

  beforeEach(waitForAsync(() => {
    component = new CaseField();
  }));

  it('should generate hierachical path for casefield hierarchies', () => {
    const gparent: CaseField = new CaseField();
    gparent.id = 'grandparent';
    gparent.parent = null;
    const parent: CaseField = new CaseField();
    parent.id = 'parent';
    parent.parent = gparent;
    component.parent = parent;
    component.id = 'child';
    const htmlId = component.getHierachicalId();
    expect(htmlId).toBe('child_parent_grandparent');
  });

  it('should return simple id for top level field', () => {
    component.parent = null;
    component.id = 'joeyramone';
    const htmlId = component.getHierachicalId();
    expect(htmlId).toBe('joeyramone');
  });

  it('should return simple id for top level field', () => {
    component.parent = null;
    component.id = 'joeyramone';
    const htmlId = component.getHierachicalId();
    expect(htmlId).toBe('joeyramone');
  });

  it('should bail out if it detects too deeply nested hierarchy', () => {
    const parent: CaseField = new CaseField();
    parent.id = 'johnnyramone';
    parent.parent = component; // deliberately create a circular reference
    component.parent = parent;
    component.id = 'joeyramone';
    const htmlId = component.getHierachicalId();
    expect(htmlId).toBe('joeyramone');
  });

  it('should be able to retrieve right values from the accessors menthods when FieldType is DynamicLists', () => {
    const fieldType: FieldType = new FieldType();
    fieldType.type = 'DynamicList';
    component.field_type = fieldType;
    expect(component.value).toBeUndefined();
    expect(component.list_items).toEqual([]);
    component.value = 'Ali';
    expect(component.value).toBe(null);
  });

  it('should be able to retrieve right values from the accessors menthods when FieldType is MultiSelectList', () => {
    const fieldType: FieldType = new FieldType();
    fieldType.type = 'DynamicMultiSelectList';
    component.field_type = fieldType;
    expect(component.value).toBeUndefined();
    expect(component.list_items).toEqual([]);
    component.value = 'Ali';
    expect(component.value).toBe(null);
  });

  it('should be able to retrieve right values from the accessors menthods when FieldType is Text', () => {
    const fieldType: FieldType = new FieldType();
    fieldType.type = 'Text';
    component.field_type = fieldType;
    expect(component.value).toBeUndefined();
    expect(component.list_items).toBeUndefined();
    component.value = 'Ali';

    expect(component.value).toBe('Ali');
    component.value = VALUE;
    expect(component.value).toBe(VALUE);
    expect(component.list_items).toBeUndefined();
  });

  it('should be able to test if the field is readonly', () => {
    expect(component.isReadonly()).toBe(false);
    component.display_context = null;
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'Mandatory';
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'Optional';
    expect(component.isReadonly()).toBe(false);
    component.display_context = 'REAdOnlY';
    expect(component.isReadonly()).toBe(true);
  });

  it('should be able to test if the field is optional or mandatory', () => {
    expect(component.isMandatory()).toBe(false);
    expect(component.isOptional()).toBe(false);
    component.display_context = null;
    expect(component.isMandatory()).toBe(false);
    expect(component.isOptional()).toBe(false);
    component.display_context = 'Mandatory';
    expect(component.isMandatory()).toBe(true);
    expect(component.isOptional()).toBe(false);
    component.display_context = 'Optional';
    expect(component.isMandatory()).toBe(false);
    expect(component.isOptional()).toBe(true);
    component.display_context = 'Readonly';
    expect(component.isMandatory()).toBe(false);
    expect(component.isOptional()).toBe(false);
  });

  it('should be able to test if the field is complex or a collection', () => {
    const fieldType: FieldType = new FieldType();
    fieldType.type = 'Complex';
    component.field_type = fieldType;
    expect(component.isComplex()).toBe(true);
    expect(component.isCollection()).toBe(false);
    fieldType.type = 'Collection';
    component.field_type = fieldType;
    expect(component.isComplex()).toBe(false);
    expect(component.isCollection()).toBe(true);
  });

  it('should be able to test if the caseField enables a complex display', () => {
    const fieldType: FieldType = new FieldType();
    component.display_context = 'REAdOnlY';
    fieldType.type = 'Complex';
    component.field_type = fieldType;
    expect(component.isComplexDisplay()).toBe(true);
    fieldType.type = 'Collection';
    component.field_type = fieldType;
    expect(component.isComplexDisplay()).toBe(true);
    fieldType.type = 'DynamicList';
    component.field_type = fieldType;
    expect(component.isComplexDisplay()).toBe(false);
    fieldType.type = 'Collection';
    component.field_type = fieldType;
    expect(component.isComplexDisplay()).toBe(true);
    component.display_context = 'Mandatory';
    expect(component.isComplexDisplay()).toBe(false);
  });

  it('should be able to test if the caseField enables a complex entry', () => {
    const fieldType: FieldType = new FieldType();
    component.display_context = 'Mandatory';
    fieldType.type = 'Complex';
    component.field_type = fieldType;
    expect(component.isComplexEntry()).toBe(true);
    fieldType.type = 'Collection';
    component.field_type = fieldType;
    expect(component.isComplexEntry()).toBe(true);
    fieldType.type = 'DynamicList';
    component.field_type = fieldType;
    expect(component.isComplexEntry()).toBe(false);
    fieldType.type = 'Collection';
    component.field_type = fieldType;
    expect(component.isComplexEntry()).toBe(true);
    component.display_context = 'Optional';
    expect(component.isComplexEntry()).toBe(true);
  });

  it ( 'should be able to extract display format from list of display context params ', () => {
    component.display_context_parameter = 'foo, bar, #DATETIMEDISPLAY(wibble), thud ';
    expect(component.dateTimeDisplayFormat).toBe('wibble');
  });

  it ('should be able to extract display format from a single display context param', () => {
    component.display_context_parameter = '#DATETIMEDISPLAY(DDMMYYHHMMSS)';
    expect(component.dateTimeDisplayFormat).toBe('DDMMYYHHMMSS');
  });

  it ('should be able to extract the first param where there are more than one', () => {
    component.display_context_parameter = 'fish, cheese, steak, #DATETIMEDISPLAY(GRAPES), bananas, #DATETIMEDISPLAY(CHOCOLATE)';
    expect(component.dateTimeDisplayFormat).toBe('GRAPES');
  });

  it ( 'should be able to extract entry format from list of entry context params ', () => {
    component.display_context_parameter = 'foo, bar, #DATETIMEENTRY(wibble), thud ';
    expect(component.dateTimeEntryFormat).toBe('wibble');
  });

  it ( 'should be able to extract format from different bracket values ', () => {
    component.display_context_parameter = '#test(bla), foo, bar, #DATETIMEENTRY(wibble), thud ';
    expect(component.dateTimeEntryFormat).toBe('wibble');
  });

  it ('should be return null for null/undef/empty display context parameterm', () => {
    component.display_context_parameter = null;
    expect(component.dateTimeDisplayFormat).toBeNull();
    component.display_context_parameter = undefined;
    expect(component.dateTimeDisplayFormat).toBeNull();
    component.display_context_parameter = '';
    expect(component.dateTimeDisplayFormat).toBeNull();
  });

  it ('should handle empty brackets', () => {
    component.display_context_parameter = '#DATETIMEDISPLAY()';
    expect(component.dateTimeDisplayFormat).toBeNull();
  });
});

describe('CaseField - set list_items when dynamic', () => {
  let component: CaseField;

  beforeEach(waitForAsync(() => {
    component = new CaseField();
    component.field_type = new FieldType();
    component.field_type.type = 'DynamicMultiSelectList';
  }));

  it('should set list_items when initially empty', () => {
    const items = [{ code: 'Code1', label: 'Label 1' }];
    component.list_items = items;
    expect(component.list_items).toEqual(items);
  });

  it('should update list_items if new list is longer', () => {
    const initialItems = [{ code: 'Code1', label: 'Label 1' }];
    const newItems = [{ code: 'Code1', label: 'Label 1' }, { code: 'Code2', label: 'Label 2' }];
    component.list_items = initialItems;
    component.list_items = newItems;
    expect(component.list_items).toEqual(newItems);
  });

  it('should not update list_items if new list is not longer', () => {
    const initialItems = [{ code: 'Code1', label: 'Label 1' }, { code: 'Code2', label: 'Label 2' }];
    const newItems = [{ code: 'Code1', label: 'Label 1' }];
    component.list_items = initialItems;
    component.list_items = newItems;
    expect(component.list_items).toEqual(initialItems);
  });

  it('should handle setting list_items to null', () => {
    const items = [{ code: 'Code1', label: 'Label 1' }];
    component.list_items = items;
    component.list_items = null;
    expect(component.list_items).toEqual(items);
  });

  it('should handle setting list_items to undefined', () => {
    const items = [{ code: 'Code1', label: 'Label 1' }];
    component.list_items = items;
    component.list_items = undefined;
    expect(component.list_items).toEqual(items);
  });
});
