import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';

import { CaseField, FieldType } from '../../../domain/definition';
import { FixedListPipe } from './fixed-list.pipe';
import { ReadFixedListFieldComponent } from './read-fixed-list-field.component';

describe('ReadFixedListFieldComponent', () => {

  const VALUE = 'F';
  const EXPECTED_LABEL = 'Female';
  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'FixedList',
    fixed_list_items: [
      {
        code: 'M',
        label: 'Male',
        order: 1
      },
      {
        code: VALUE,
        label: EXPECTED_LABEL,
        order: 2
      },
      {
        code: 'O',
        label: 'Other',
        order: 3
      }
    ]
  };

  describe('Non-persistable readonly fixed list field', () => {
    const ITEMS = [
      {
        code: 'M',
        label: 'Male',
        order: 1
      },
      {
        code: VALUE,
        label: EXPECTED_LABEL,
        order: 2
      },
      {
        code: 'O',
        label: 'Other',
        order: 3
      }
    ];

    const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE,
    });

    const EMPTY = '';

    let fixture: ComponentFixture<ReadFixedListFieldComponent>;
    let component: ReadFixedListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadFixedListFieldComponent,
            FixedListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadFixedListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render label associated to the value provided', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

    it('render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });
  });

  describe('ReadFixedListFieldComponent for dynamiclist type', () => {
    const VALUE_DYNAMIC_LIST = '{\n' +
      '            "value": {\n' +
      '              "code": "F",\n' +
      '              "label": "Female"\n' +
      '            },\n' +
      '            "list_items": [\n' +
      '              {\n' +
      '                "code": "F",\n' +
      '                "label": "Female"\n' +
      '              },\n' +
      '              {\n' +
      '                "code": "M",\n' +
      '                "label": "Male"\n' +
      '              }' +
      '            ]\n' +
      '          }';

    const FIELD_TYPE_DYNAMIC_LIST: FieldType = {
      id: 'Gender',
      type: 'DynamicList',
      fixed_list_items: []
    };
    const ITEMS = [
      {
        code: 'M',
        label: 'Male',
        order: 1
      },
      {
        code: 'F',
        label: 'Female',
        order: 2
      },
      {
        code: 'O',
        label: 'Other',
        order: 3
      }
    ];
    const CASE_FIELD_DYNAMIC_LIST: CaseField = Object.assign(new CaseField(), {
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE_DYNAMIC_LIST,
      value: JSON.parse(VALUE_DYNAMIC_LIST),
    });
    const EMPTY = '';

    let fixture: ComponentFixture<ReadFixedListFieldComponent>;
    let component: ReadFixedListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadFixedListFieldComponent,
            FixedListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadFixedListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD_DYNAMIC_LIST;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render label associated to the dynamic list value provided', () => {
      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

  });

  describe('Persistable readonly fixed list field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = Object.assign(new CaseField(), {
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });

    let fixture: ComponentFixture<ReadFixedListFieldComponent>;
    let component: ReadFixedListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadFixedListFieldComponent,
            FixedListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadFixedListFieldComponent);
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
});
