import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../domain/definition/field-type.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { ReadMultiSelectListFieldComponent } from './read-multi-select-list-field.component';
import { text } from '../../../test/helpers';
import { FixedListPipe } from '../fixed-list/fixed-list.pipe';

describe('ReadMultiSelectListFieldComponent', () => {

  const $VALUES = By.css('table>tbody>tr>td');

  const FIELD_TYPE: FieldType = {
    id: 'MultiSelectList',
    type: 'MultiSelectList',
    fixed_list_items: [
      {
        label: 'Pierre',
        code: 'P'
      },
      {
        label: 'Paul',
        code: 'PA'
      },
      {
        label: 'Jacques',
        code: 'J'
      }
    ]
  };
  const VALUES = [ 'P', 'PA', 'J' ];
  const CASE_FIELD = new CaseField();
  CASE_FIELD.id = 'x';
  CASE_FIELD.label = 'X';
  CASE_FIELD.field_type = FIELD_TYPE;
  CASE_FIELD.value = VALUES;

  let FieldReadComponent = MockComponent({
    selector: 'ccd-field-read',
    inputs: ['caseField']
  });

  let fixture: ComponentFixture<ReadMultiSelectListFieldComponent>;
  let component: ReadMultiSelectListFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          ReadMultiSelectListFieldComponent,
          FixedListPipe,

          // Mock
          FieldReadComponent
        ],
        providers: []
      })
      .compileComponents();

    fixture = TestBed.createComponent(ReadMultiSelectListFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('render values as a table with one row and one cell per value', () => {
    component.caseField.value = VALUES;
    fixture.detectChanges();

    let cells = de.queryAll($VALUES);

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
