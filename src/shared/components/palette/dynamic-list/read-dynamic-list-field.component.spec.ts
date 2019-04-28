import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDynamicListFieldComponent } from './read-dynamic-list-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { DynamicListPipe } from './dynamic-list.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';

describe('ReadDynamicListFieldComponent', () => {
  const VALUE = {
    default: {code: 'F' , label: 'Female'},
    dynamic_list_items: [
      {
        code: 'M',
        label: 'Male'
      },
      {
        code: 'F',
        label: 'Female'
      },
      {
        code: 'O',
        label: 'Other'
      }
    ]
  };
  const EXPECTED_LABEL = 'Female';
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'DynamicList',
    dynamic_list_items: [
      {
        code: 'M',
        label: 'Male'
      },
      {
        code: JSON.stringify(VALUE),
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
