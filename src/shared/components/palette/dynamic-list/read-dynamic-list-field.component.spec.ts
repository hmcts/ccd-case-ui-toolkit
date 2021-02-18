import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDynamicListFieldComponent } from './read-dynamic-list-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { DynamicListPipe } from './dynamic-list.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('ReadDynamicListFieldComponent', () => {

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

    let fixture: ComponentFixture<ReadDynamicListFieldComponent>;
    let component: ReadDynamicListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicListFieldComponent,
            DynamicListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicListFieldComponent);
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

  describe('ReadDynamicListFieldComponent for dynamiclist type', () => {
    const VALUE_DYNAMIC_LIST = `{
                  "value": {
                    "code": "F",
                    "label": "Female"
                  },
                  "list_items": [
                    {
                      "code": "F",
                      "label": "Female"
                    },
                    {
                      "code": "M",
                      "label": "Male"
                    }
                 ]
                }`;

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

    let fixture: ComponentFixture<ReadDynamicListFieldComponent>;
    let component: ReadDynamicListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicListFieldComponent,
            DynamicListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD_DYNAMIC_LIST;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render label associated to the dynamic list value provided', () => {
      expect(de.nativeElement.textContent).toEqual(EXPECTED_LABEL);
    });

  });

});