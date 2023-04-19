import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockComponent } from 'ng2-mock-component';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { FixedListPipe } from '../fixed-list/fixed-list.pipe';
import { ReadDynamicMultiSelectListFieldComponent } from './read-dynamic-multi-select-list-field.component';

const FIELD_ID = 'ReadOnlyFieldId';
const FORMATTED_LIST_ITEMS = [
  {
    label: 'Boris',
    code: 'P',
    order: 1
  },
  {
    label: 'Rishi',
    code: 'PA',
    order: 2
  }
];
const FIELD_LIST_ITEMS = [
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
];
const FIELD_TYPE: FieldType = {
  id: 'MultiSelectList',
  type: 'MultiSelectList',
};
const VALUES = [
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
];

let caseField: CaseField;

describe('ReadDynamicMultiSelectListFieldComponent', () => {
  describe('Non-persistable readonly multi-select-list field', () => {
    let fixture: ComponentFixture<ReadDynamicMultiSelectListFieldComponent>;
    let component: ReadDynamicMultiSelectListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      caseField = new CaseField();
      caseField.id = FIELD_ID;
      caseField.label = 'X';
      caseField.field_type = FIELD_TYPE;
      caseField.value = VALUES;
      caseField.list_items = FIELD_LIST_ITEMS;

      const fieldReadComponentMock = MockComponent({
        selector: 'ccd-field-read',
        inputs: ['caseField']
      });

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicMultiSelectListFieldComponent,
            FixedListPipe,
            // Mocks
            fieldReadComponentMock
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicMultiSelectListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = caseField;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

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

  describe('Non-persistable readonly multi-select-list field with just formatted_value', () => {
    let fixture: ComponentFixture<ReadDynamicMultiSelectListFieldComponent>;
    let component: ReadDynamicMultiSelectListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      caseField = new CaseField();
      caseField.id = FIELD_ID;
      caseField.label = 'X';
      caseField.field_type = FIELD_TYPE;
      caseField.value = null;
      caseField.list_items = null;
      caseField.formatted_value = {
        value: [FORMATTED_LIST_ITEMS[0]],
        list_items: FORMATTED_LIST_ITEMS
      };

      const fieldReadComponentMock = MockComponent({
        selector: 'ccd-field-read',
        inputs: ['caseField']
      });

      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicMultiSelectListFieldComponent,
            FixedListPipe,
            // Mocks
            fieldReadComponentMock
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicMultiSelectListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = caseField;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render formatted list items when list_items is null', () => {
      expect(de.children.length).toBe(1);
    });

    it('should set formatted list value when value is not set', () => {
      expect(component.caseField.value).toEqual([FORMATTED_LIST_ITEMS[0]]);
    });
  });
});
