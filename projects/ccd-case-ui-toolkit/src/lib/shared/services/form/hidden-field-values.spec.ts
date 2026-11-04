import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ConditionalShowFormDirective } from '../../directives/conditional-show/conditional-show-form.directive';
import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsUtils } from '../fields/fields.utils';
import { HiddenFieldValues } from './hidden-field-values';
import { FormValueService } from './form-value.service';
import { FieldTypeSanitiser } from './field-type-sanitiser';

describe('HiddenFieldValues', () => {
  function fieldControl(value: any, options: Partial<CaseField> = {}) {
    return Object.assign(new FormControl(value), {
      caseField: { hidden: false, display_context: 'OPTIONAL', ...options }
    });
  }

  [false, null, undefined].forEach((retain_hidden_value) => {
    it(`clears populated hidden fields with retention ${retain_hidden_value} even when pristine`, () => {
      const control = fieldControl('populated value', { hidden: true, retain_hidden_value });
      expect(HiddenFieldValues.clearHiddenValues(control.value, control)).toBeNull();
      expect(control.pristine).toBeTrue();
      expect(control.value).toBe('populated value');
    });
  });

  [false, true].forEach((dirty) => {
    it(`preserves populated hidden fields with retention Yes and dirty=${dirty}`, () => {
      const control = fieldControl('keep this value', { hidden: true, retain_hidden_value: true });
      if (dirty) {
        control.markAsDirty();
      }
      expect(HiddenFieldValues.clearHiddenValues(control.value, control)).toBe('keep this value');
    });
  });

  [false, true, null].forEach((retain_hidden_value) => {
    it(`preserves visible values with retention ${retain_hidden_value}`, () => {
      const control = fieldControl('visible input', { retain_hidden_value });
      expect(HiddenFieldValues.clearHiddenValues(control.value, control)).toBe('visible input');
    });
  });

  [false, 0, 'text', '-11-16', ['option']].forEach((value) => {
    it(`clears hidden ${JSON.stringify(value)} without relying on truthiness`, () => {
      const control = fieldControl(value, { hidden: true });
      expect(HiddenFieldValues.clearHiddenValues(control.value, control)).toBeNull();
    });
  });

  it('clears the incomplete hearing date when the user changes Yes to No', () => {
    const selection = fieldControl('Yes', { id: 'hearingScheduledPreferenceYesNo' });
    const date = fieldControl('-11-16', {
      id: 'hearingScheduledDate', retain_hidden_value: null,
      show_condition: 'hearingScheduledPreferenceYesNo="Yes"'
    });
    date.setValidators(Validators.pattern(/^\d{4}-\d{2}-\d{2}$/));
    date.updateValueAndValidity();
    const form = new FormGroup({ hearingScheduledPreferenceYesNo: selection, hearingScheduledDate: date });
    const directive = new ConditionalShowFormDirective(new FieldsUtils());
    directive.formGroup = form;
    directive.caseFields = [selection.caseField, date.caseField] as CaseField[];
    directive.evalAllShowHideConditions();
    expect(form.invalid).toBeTrue();
    selection.setValue('No');
    directive.evalAllShowHideConditions();
    expect(form.valid).toBeTrue();
    expect(HiddenFieldValues.clearHiddenValues(form.getRawValue(), form)).toEqual({
      hearingScheduledPreferenceYesNo: 'No', hearingScheduledDate: null
    });
  });

  it('clears the pristine reason when a revisited page has Yes selected', () => {
    const selection = fieldControl('Yes', { id: 'isWithNotice' });
    const reason = fieldControl('test', {
      id: 'reasonsForWithoutNotice', retain_hidden_value: null, show_condition: 'isWithNotice="No"'
    });
    const group = new FormGroup({ isWithNotice: selection, reasonsForWithoutNotice: reason });
    const directive = new ConditionalShowFormDirective(new FieldsUtils());
    directive.formGroup = group;
    directive.caseFields = [selection.caseField, reason.caseField] as CaseField[];
    directive.evalAllShowHideConditions();
    const form = new FormGroup({ generalAppInformOtherParty: group });
    expect(reason.pristine).toBeTrue();
    expect(reason.caseField.hidden).toBeTrue();
    expect(HiddenFieldValues.clearHiddenValues(form.getRawValue(), form)).toEqual({
      generalAppInformOtherParty: { isWithNotice: 'Yes', reasonsForWithoutNotice: null }
    });
    selection.setValue('No');
    directive.evalAllShowHideConditions();
    expect(HiddenFieldValues.clearHiddenValues(form.getRawValue(), form)).toEqual({
      generalAppInformOtherParty: { isWithNotice: 'No', reasonsForWithoutNotice: 'test' }
    });
  });

  it('uses each child retention setting when a retained complex parent is hidden', () => {
    const retained = fieldControl('keep', { retain_hidden_value: true });
    const cleared = fieldControl('clear', { retain_hidden_value: false });
    const defaulted = fieldControl('clear by default');
    const complex = Object.assign(new FormGroup({ retained, cleared, defaulted }), {
      caseField: { hidden: true, retain_hidden_value: true, field_type: { type: 'Complex' } }
    });
    expect(HiddenFieldValues.clearHiddenValues(complex.getRawValue(), complex)).toEqual({
      retained: 'keep', cleared: null, defaulted: null
    });
  });

  it('clears a hidden complex parent with retention No as a whole', () => {
    const complex = Object.assign(new FormGroup({ input: fieldControl('value') }), {
      caseField: { hidden: true, retain_hidden_value: false, field_type: { type: 'Complex' } }
    });
    expect(HiddenFieldValues.clearHiddenValues(complex.getRawValue(), complex)).toBeNull();
  });

  it('preserves a retained hidden document as one value', () => {
    const document = Object.assign(new FormGroup({
      document_url: new FormControl('/documents/1'), document_filename: new FormControl('evidence.pdf')
    }), { caseField: { hidden: true, retain_hidden_value: true, field_type: { type: 'Document' } } });
    expect(HiddenFieldValues.clearHiddenValues(document.getRawValue(), document)).toEqual(document.getRawValue());
  });

  it('uses per-child retention inside retained complex collections and keeps row IDs', () => {
    const value = Object.assign(new FormGroup({
      retained: fieldControl('keep', { retain_hidden_value: true }), cleared: fieldControl('clear')
    }), { caseField: { hidden: false, field_type: { type: 'Complex' } } });
    const collection = Object.assign(new FormArray([
      new FormGroup({ id: new FormControl('row-1'), value })
    ]), { caseField: {
      hidden: true, retain_hidden_value: true,
      field_type: { type: 'Collection', collection_field_type: { type: 'Complex' } }
    } });
    expect(HiddenFieldValues.clearHiddenValues(collection.getRawValue(), collection)).toEqual([
      { id: 'row-1', value: { retained: 'keep', cleared: null } }
    ]);
  });

  [false, true].forEach((retain_hidden_value) => {
    it(`applies collection retention ${retain_hidden_value} to hidden simple collections`, () => {
      const collection = Object.assign(new FormArray([new FormControl('value')]), {
        caseField: { hidden: true, retain_hidden_value, field_type: { type: 'Collection' } }
      });
      expect(HiddenFieldValues.clearHiddenValues(collection.getRawValue(), collection))
        .toEqual(retain_hidden_value ? ['value'] : []);
    });
  });

  ['READONLY', 'HIDDEN', 'HIDDEN_TEMP'].forEach((display_context) => {
    it(`preserves protected ${display_context} fields and their descendants`, () => {
      const group = Object.assign(new FormGroup({ input: fieldControl('keep', { hidden: true }) }), {
        caseField: { hidden: true, display_context }
      });
      expect(HiddenFieldValues.clearHiddenValues(group.getRawValue(), group)).toEqual({ input: 'keep' });
    });
  });

  it('preserves linked-case values', () => {
    const control = fieldControl('keep', { id: 'caseLinks', hidden: true });
    expect(HiddenFieldValues.clearHiddenValues(control.value, control)).toBe('keep');
  });

  it('clears a hidden dynamic-list selection after serialization without mutating its form value', () => {
    const field = Object.assign(new CaseField(), {
      id: 'selection', hidden: true, retain_hidden_value: false, display_context: 'OPTIONAL',
      field_type: { type: 'DynamicList' },
      value: { value: null, list_items: [{ code: 'A', label: 'Option A' }] }
    });
    const control = fieldControl('A');
    control.caseField = field;
    const form = new FormGroup({ selection: control });
    const data = form.getRawValue();
    new FormValueService(new FieldTypeSanitiser()).sanitiseDynamicLists([field], { data });
    expect(data.selection.value.code).toBe('A');
    expect(HiddenFieldValues.clearHiddenValues(data, form)).toEqual({ selection: null });
    expect(control.value).toBe('A');
  });

  it('preserves missing controls and null values', () => {
    expect(HiddenFieldValues.clearHiddenValues({ value: 'keep' }, undefined)).toEqual({ value: 'keep' });
    expect(HiddenFieldValues.clearHiddenValues(null, new FormControl())).toBeNull();
  });
});
