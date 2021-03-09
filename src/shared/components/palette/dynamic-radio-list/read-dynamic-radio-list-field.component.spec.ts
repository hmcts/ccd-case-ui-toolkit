import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDynamicRadioListFieldComponent } from './read-dynamic-radio-list-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { DynamicRadioListPipe } from './dynamic-radio-list.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormGroup } from '@angular/forms';

describe('ReadDynamicRadioListFieldComponent', () => {

  const VALUE = 'F';
  const EXPECTED_LABEL = 'Female';
  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'DynamicRadioList',
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

  describe('Non-persistable readonly fixed radio list field', () => {
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });
    const EMPTY = '';

    let fixture: ComponentFixture<ReadDynamicRadioListFieldComponent>;
    let component: ReadDynamicRadioListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicRadioListFieldComponent,
            DynamicRadioListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicRadioListFieldComponent);
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

  describe('Persistable readonly fixed radio list field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });

    let fixture: ComponentFixture<ReadDynamicRadioListFieldComponent>;
    let component: ReadDynamicRadioListFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadDynamicRadioListFieldComponent,
            DynamicRadioListPipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDynamicRadioListFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[CASE_FIELD.id]).toBeTruthy();
      expect(FORM_GROUP.controls[CASE_FIELD.id].value).toBe(VALUE);
    });

  });

});
