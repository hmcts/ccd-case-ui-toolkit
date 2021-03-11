import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { ReadDynamicMultiSelectListFieldComponent } from './read-dynamic-multi-select-list-field.component';
import { text } from '../../../test/helpers';
import { FixedListPipe } from '../fixed-list/fixed-list.pipe';
import { FormGroup } from '@angular/forms';

describe('ReadDynamicMultiSelectListFieldComponent', () => {

  const $VALUES = By.css('table>tbody>tr>td');

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'MultiSelectList',
    type: 'MultiSelectList',
    fixed_list_items: [
      {
        label: 'Pierre',
        code: 'P',
        order: 1
      },
      {
        label: 'Paul',
        code: 'PA',
        order: 2
      },
      {
        label: 'Jacques',
        code: 'J',
        order: 3
      }
    ]
  };
  const VALUES = ['P', 'PA', 'J'];

  describe('Non-persistable readonly multi-select-list field', () => {
    const CASE_FIELD = new CaseField();
    CASE_FIELD.id = FIELD_ID;
    CASE_FIELD.label = 'X';
    CASE_FIELD.field_type = FIELD_TYPE;
    CASE_FIELD.value = VALUES;

    let FieldReadComponent = MockComponent({
      selector: 'ccd-field-read',
      inputs: ['caseField']
    });

    let fixture: ComponentFixture<ReadDynamicMultiSelectListFieldComponent>;
    let component: ReadDynamicMultiSelectListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicMultiSelectListFieldComponent,
            FixedListPipe,

            // Mock
            FieldReadComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicMultiSelectListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render values as a table with one row and one cell per value', () => {
      component.caseField.value = VALUES;
      fixture.detectChanges();

      const cells = de.queryAll($VALUES);

      expect(cells.length).toEqual(VALUES.length);

      for (let i = 0; i < VALUES.length; i++) {
        expect(FIELD_TYPE.fixed_list_items[i].label).toEqual(text(cells[i]));
      }
    });

    it('should NOT render anything when value is undefined', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });

    it('should NOT render anything when value is null', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });

    it('should NOT render anything when value is empty array', () => {
      component.caseField.value = [];
      fixture.detectChanges();

      expect(de.children.length).toBe(0);
    });
  });

  describe('Persistable readonly multi-select-list field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD = new CaseField();
    CASE_FIELD.id = FIELD_ID;
    CASE_FIELD.label = 'X';
    CASE_FIELD.field_type = FIELD_TYPE;
    CASE_FIELD.value = VALUES;

    let FieldReadComponent = MockComponent({
      selector: 'ccd-field-read',
      inputs: ['caseField']
    });

    let fixture: ComponentFixture<ReadDynamicMultiSelectListFieldComponent>;
    let component: ReadDynamicMultiSelectListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicMultiSelectListFieldComponent,
            FixedListPipe,

            // Mock
            FieldReadComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicMultiSelectListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[CASE_FIELD.id]).toBeTruthy();
      expect(FORM_GROUP.controls[CASE_FIELD.id].value).toBe(VALUES);
    });

  });

});
