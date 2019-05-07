import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadFixedListFieldComponent } from './read-fixed-list-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { FixedListPipe } from './fixed-list.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('ReadFixedListFieldComponent', () => {

  const VALUE = 'F';
  const EXPECTED_LABEL = 'Female';
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'FixedList',
    fixed_list_items: [
      {
        code: 'M',
        label: 'Male'
      },
      {
        code: VALUE,
        label: EXPECTED_LABEL
      },
      {
        code: 'O',
        label: 'Other'
      }
    ]
  };
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  };

  const EMPTY = '';

  let fixture: ComponentFixture<ReadFixedListFieldComponent>;
  let component: ReadFixedListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
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

  const CHANGED_VALUE_DYNAMIC_LIST = '{\n' +
    '            "value": {\n' +
    '              "code": "M",\n' +
    '              "label": "Male"\n' +
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
  const EXPECTED_LABEL = 'Male';
  const FIELD_TYPE_DYNAMIC_LIST: FieldType = {
    id: 'Gender',
    type: 'DynamicList',
    fixed_list_items: []
  };
  const CASE_FIELD_DYNAMIC_LIST: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE_DYNAMIC_LIST,
    value: JSON.parse(VALUE_DYNAMIC_LIST)
  };
  const EMPTY = '';

  let fixture: ComponentFixture<ReadFixedListFieldComponent>;
  let component: ReadFixedListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
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
    component.caseField.value = JSON.parse(CHANGED_VALUE_DYNAMIC_LIST);
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
