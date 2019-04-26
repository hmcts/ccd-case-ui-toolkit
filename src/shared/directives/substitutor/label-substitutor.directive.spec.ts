import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement, Component, Input } from '@angular/core';
import { LabelSubstitutorDirective } from './label-substitutor.directive';
import { CaseField } from '../../domain/definition/case-field.model';
import { async } from '@angular/core/testing';
import { FormGroup, FormControl } from '@angular/forms';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { PlaceholderService } from './services/placeholder.service';
import createSpyObj = jasmine.createSpyObj;

@Component({
  template: `
    <tr ccdLabelSubstitutor [caseField]="caseField" [formGroup]="formGroup" [contextFields]="caseFields"
        [elementsToSubstitute]="elementsToSubstitute">
      <td>{{caseField.label}}</td>
      <td>{{caseField.hint_text}}</td>
      <td>{{caseField.value}}</td>
    </tr>`
})
class TestHostComponent {

  @Input() caseField: CaseField;
  @Input() caseFields: CaseField[];
  @Input() formGroup: FormGroup = new FormGroup({});
  @Input() elementsToSubstitute: string[] = ['label', 'hint_text', 'value'];
}

let field = (id, value, fieldType, label?, hintText?) => {
  let caseField = new CaseField();
  caseField.id = id;
  caseField.value = value;
  caseField.field_type = fieldType;
  caseField.label = label;
  caseField.hint_text = hintText;
  return caseField;
};

let textField = (id, value, label?, hintText?) => {
  let caseField = new CaseField();
  caseField.id = id;
  caseField.value = value;
  caseField.field_type = {
    id: id,
    type: 'Text'
  };
  caseField.label = label;
  caseField.hint_text = hintText;
  return caseField;
};

describe('LabelSubstitutorDirective', () => {

  let comp: TestHostComponent;
  let fixture: ComponentFixture<TestHostComponent>;
  let de: DebugElement;
  let labelEl: HTMLElement;
  let hintEl: HTMLElement;
  let valueEl: HTMLElement;
  let placeholderService: any;

  beforeEach(async(() => {
    placeholderService = createSpyObj<PlaceholderService>('placeholderService', ['resolvePlaceholders']);

    TestBed.configureTestingModule({
      declarations: [LabelSubstitutorDirective, TestHostComponent],
      providers: [FieldsUtils,
        {provide: PlaceholderService, useValue: placeholderService}]
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement;
    labelEl = de.query(By.css('tr> td:nth-child(1)')).nativeElement;
    hintEl = de.query(By.css('tr> td:nth-child(2)')).nativeElement;
    valueEl = de.query(By.css('tr> td:nth-child(3)')).nativeElement;
  }));

  describe('simple type fields', () => {

    it('should display elements', () => {
      let label = 'Label B with valueA=${LabelA} and valueA=${LabelA}:1';
      let hintText = 'Label B with valueA=${LabelA} and valueA=${LabelA}:2';
      let value = 'Label B with valueA=${LabelA} and valueA=${LabelA}:3';
      comp.caseField = textField('LabelB', value, label, hintText);
      comp.caseFields = [comp.caseField];

      placeholderService.resolvePlaceholders.and
        .returnValues('Label B with valueA=ValueA and valueA=ValueA:1',
          'Label B with valueA=ValueA and valueA=ValueA:2',
          'Label B with valueA=ValueA and valueA=ValueA:3');
      fixture.detectChanges();

      expect(labelEl.innerText).toBe('Label B with valueA=ValueA and valueA=ValueA:1');
      expect(hintEl.innerText).toBe('Label B with valueA=ValueA and valueA=ValueA:2');
      expect(valueEl.innerText).toBe('Label B with valueA=ValueA and valueA=ValueA:3');
    });

    it('should display undefined elements', () => {
      let label = undefined;
      let hintText = undefined;
      let value = undefined;
      comp.caseField = textField('LabelB', value, label, hintText);
      comp.caseFields = [comp.caseField];

      placeholderService.resolvePlaceholders.and.returnValues(label, hintText, value);
      fixture.detectChanges();

      expect(labelEl.innerText).toBe('');
      expect(hintEl.innerText).toBe('');
      expect(valueEl.innerText).toBe('');
    });

    it('should display empty elements', () => {
      let label = '';
      let hintText = '';
      let value = '';
      comp.caseField = textField('LabelB', value, label, hintText);
      comp.caseFields = [comp.caseField];

      placeholderService.resolvePlaceholders.and.returnValues(label, hintText, value);
      fixture.detectChanges();

      expect(labelEl.innerText).toBe('');
      expect(hintEl.innerText).toBe('');
      expect(valueEl.innerText).toBe('');
    });

    it('should use elementsToSubstitute to select which caseField elements we substitute', () => {
      let label = 'Some label';
      let hintText = 'Some hint text';
      let value = 'Some value';
      comp.caseField = textField('LabelB', value, label, hintText);
      comp.caseFields = [comp.caseField];
      comp.elementsToSubstitute = ['value'];

      placeholderService.resolvePlaceholders.and.returnValues('updated value');
      fixture.detectChanges();

      expect(labelEl.innerText).toBe(label);
      expect(hintEl.innerText).toBe(hintText);
      expect(valueEl.innerText).toBe('updated value');
    });

    it('should pass case field value to substitute label when case field value but no form field value present', () => {
      let label = 'someLabel:';
      comp.caseField = textField('LabelB', undefined, label);
      comp.caseFields = [comp.caseField, field('LabelA', 'ValueA', '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: undefined, LabelA: 'ValueA'}, label);
    });

    it('should pass form value to substitute label if both case field and form values exist for same field', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', 'ValueA1', '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('ValueA2'),
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: 'ValueA2'}, label);
    });

    it('should pass correct values when both form field and case field values present for different fields', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, textField('LabelD', 'ValueD', '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('ValueA'),
        LabelC: new FormControl('ValueC')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders)
        .toHaveBeenCalledWith({LabelB: '', LabelA: 'ValueA', LabelC: 'ValueC', LabelD: 'ValueD'}, label);
    });
  });

  describe('fixed list type fields', () => {

    it('should pass form field value when field is not read only and no case field value but form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '', {
        id: 'LabelA',
        type: 'FixedList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          }
        ]
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('ValueA')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: 'Option A'}, label);
    });

    it('should pass case field value when field is read only and no form field but case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', 'ValueC', {
        id: 'LabelA',
        type: 'FixedList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          }
        ]
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: 'Option C'}, label);
    });

    it('should pass field form value when field is not read only and both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', 'ValueC', {
        id: 'LabelA',
        type: 'FixedList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          }
        ]
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('ValueA')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: 'Option A'}, label);
    });
  });

  describe('multi list type fields', () => {

    it('should pass form field value when field is not read only and no case field value but form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '', {
        id: 'LabelA',
        type: 'MultiSelectList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          },
          {
            code: 'ValueD',
            label: 'Option D'
          }
        ]
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(['ValueA', 'ValueD'])
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: ['ValueA', 'ValueD'], 'LabelA-LABEL': ['Option A', 'Option D']}, label);
    });

    it('should pass case field value when field is read only and no form field but case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', ['ValueC', 'ValueD'], {
        id: 'LabelA',
        type: 'MultiSelectList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          },
          {
            code: 'ValueD',
            label: 'Option D'
          }
        ]
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: ['ValueC', 'ValueD'], 'LabelA-LABEL': ['Option C', 'Option D']}, label);
    });

    it('should pass field form value when field is not read only and both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', 'ValueC', {
        id: 'LabelA',
        type: 'MultiSelectList',
        fixed_list_items: [
          {
            code: 'ValueA',
            label: 'Option A'
          },
          {
            code: 'ValueC',
            label: 'Option C'
          },
          {
            code: 'ValueD',
            label: 'Option D'
          }
        ]
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(['ValueA', 'ValueC'])
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith(
        {LabelB: '', LabelA: ['ValueA', 'ValueC'], 'LabelA-LABEL': ['Option A', 'Option C']}, label);
    });
  });

  describe('MoneyGBP type fields', () => {

    it('should pass null value for null MoneyGBP', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', null, {
        id: 'LabelA',
        type: 'MoneyGBP'
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: null}, label);
    });

    it('should pass case field value with MoneyGBP when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '20055', {
        id: 'LabelA',
        type: 'MoneyGBP'
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '£200.55'}, label);
    });

    it('should pass form field value with MoneyGBP when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '', {
        id: 'LabelA',
        type: 'MoneyGBP'
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('20055')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '£200.55'}, label);
    });

    it('should pass form field value with MoneyGBP when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '99999', {
        id: 'LabelA',
        type: 'MoneyGBP'
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('20055')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '£200.55'}, label);
    });
  });

  describe('Date type fields', () => {

    it('should pass case field value with Date when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '2018-03-07', {
        id: 'LabelA',
        type: 'Date'
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '7 Mar 2018'}, label);
    });

    it('should pass form field value with Date when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '', {
        id: 'LabelA',
        type: 'Date'
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('2018-03-07')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '7 Mar 2018'}, label);
    });

    it('should pass form field value with Date when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '2018-03-07', {
        id: 'LabelA',
        type: 'Date'
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('2018-03-07')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '7 Mar 2018'}, label);
    });

    it('should pass form field value with invalid date when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      comp.caseFields = [comp.caseField, field('LabelA', '2018-03', {
        id: 'LabelA',
        type: 'Date'
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl('2018-03')
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: '{ Invalid Date: 2018-03 }'}, label);
    });
  });

  describe('Collection type fields', () => {

    it('should pass form field value with comma delimited text items when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [
        {
          value: 'Pierre',
        },
        {
          value: 'Paul',
        },
        {
          value: 'Jacques',
        }
      ];
      comp.caseFields = [comp.caseField, field('LabelA', VALUES, {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Text',
          type: 'Text'
        }
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });

    it('should pass form field value with comma delimited text items when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [
        {
          value: 'Pierre',
        },
        {
          value: 'Paul',
        },
        {
          value: 'Jacques',
        }
      ];
      comp.caseFields = [comp.caseField, field('LabelA', [], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Text',
          type: 'Text'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });

    it('should pass form field value with comma delimited text items when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [
        {
          value: 'Pierre',
        },
        {
          value: 'Paul',
        },
        {
          value: 'Jacques',
        }
      ];
      comp.caseFields = [comp.caseField, field('LabelA', [
        {
          value: 'Tom',
        },
        {
          value: 'George',
        },
        {
          value: 'John',
        }
      ], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Text',
          type: 'Text'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });
  });

  describe('Collection of fixed list type fields', () => {

    it('should pass form field value with comma delimited label items when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [{value: 'ValueA'}, {value: 'ValueC'}, {value: 'ValueD'}];
      comp.caseFields = [comp.caseField, field('LabelA', VALUES, {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'FixedList',
          type: 'FixedList',
          fixed_list_items: [
            {
              code: 'ValueA',
              label: 'Option A'
            },
            {
              code: 'ValueC',
              label: 'Option C'
            },
            {
              code: 'ValueD',
              label: 'Option D'
            }
          ]
        }
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [{value: 'ValueA'}, {value: 'ValueC'}, {value: 'ValueD'}];
      comp.caseFields = [comp.caseField, field('LabelA', [], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'FixedList',
          type: 'FixedList',
          fixed_list_items: [
            {
              code: 'ValueA',
              label: 'Option A'
            },
            {
              code: 'ValueC',
              label: 'Option C'
            },
            {
              code: 'ValueD',
              label: 'Option D'
            }
          ]
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const VALUES = [{value: 'ValueA'}, {value: 'ValueC'}, {value: 'ValueD'}];
      comp.caseFields = [comp.caseField, field('LabelA', [{value: 'ValueD'}, {value: 'ValueD'}, {value: 'ValueD'}], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'FixedList',
          type: 'FixedList',
          fixed_list_items: [
            {
              code: 'ValueA',
              label: 'Option A'
            },
            {
              code: 'ValueC',
              label: 'Option C'
            },
            {
              code: 'ValueD',
              label: 'Option D'
            }
          ]
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: VALUES}, label);
    });
  });

  describe('Collection of MoneyGBP type fields', () => {

    it('should pass form field value with comma delimited label items when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '12345'}, {value: '34888'}, {value: '9944521'}];
      const TRANSFORMED_VALUES = [{value: '£123.45'}, {value: '£348.88'}, {value: '£99,445.21'}];
      comp.caseFields = [comp.caseField, field('LabelA', RAW_VALUES, {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'MoneyGBP',
          type: 'MoneyGBP'
        }
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '12345'}, {value: '34888'}, {value: '9944521'}];
      const TRANSFORMED_VALUES = [{value: '£123.45'}, {value: '£348.88'}, {value: '£99,445.21'}];
      comp.caseFields = [comp.caseField, field('LabelA', [], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'MoneyGBP',
          type: 'MoneyGBP'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(RAW_VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '12345'}, {value: '34888'}, {value: '9944521'}];
      const TRANSFORMED_VALUES = [{value: '£123.45'}, {value: '£348.88'}, {value: '£99,445.21'}];
      comp.caseFields = [comp.caseField, field('LabelA', [{value: 'ValueD'}, {value: 'ValueD'}, {value: 'ValueD'}], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'MoneyGBP',
          type: 'MoneyGBP'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(RAW_VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });
  });

  describe('Collection of Date type fields', () => {

    it('should pass form field value with comma delimited label items when case field value but no form field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '2018-03-07'}, {value: '2015-02-22'}, {value: '2017-12-12'}];
      const TRANSFORMED_VALUES = [{value: '7 Mar 2018'}, {value: '22 Feb 2015'}, {value: '12 Dec 2017'}];
      comp.caseFields = [comp.caseField, field('LabelA', RAW_VALUES, {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Date',
          type: 'Date'
        }
      }, '')];
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when form field value but no case field value present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '2018-03-07'}, {value: '2015-02-22'}, {value: '2017-12-12'}];
      const TRANSFORMED_VALUES = [{value: '7 Mar 2018'}, {value: '22 Feb 2015'}, {value: '12 Dec 2017'}];
      comp.caseFields = [comp.caseField, field('LabelA', [], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Date',
          type: 'Date'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(RAW_VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });

    it('should pass form field value with comma delimited label items when both form and case field values present', () => {
      let label = 'someLabel';
      comp.caseField = textField('LabelB', '', label);
      const RAW_VALUES = [{value: '2018-03-07'}, {value: '2015-02-22'}, {value: '2017-12-12'}];
      const TRANSFORMED_VALUES = [{value: '7 Mar 2018'}, {value: '22 Feb 2015'}, {value: '12 Dec 2017'}];
      comp.caseFields = [comp.caseField, field('LabelA', [{value: 'ValueD'}, {value: 'ValueD'}, {value: 'ValueD'}], {
        id: 'LabelA',
        type: 'Collection',
        collection_field_type: {
          id: 'Date',
          type: 'Date'
        }
      }, '')];
      comp.formGroup = new FormGroup({
        LabelA: new FormControl(RAW_VALUES)
      });
      fixture.detectChanges();

      expect(placeholderService.resolvePlaceholders).toHaveBeenCalledWith({LabelB: '', LabelA: TRANSFORMED_VALUES}, label);
    });
  });
});
