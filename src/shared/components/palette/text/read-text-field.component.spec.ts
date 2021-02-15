import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadTextFieldComponent } from './read-text-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormGroup } from '@angular/forms';

describe('ReadTextFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'Text',
    type: 'Text'
  };
  const VALUE = 'Hello world';
  const FIELD_ID = 'ReadOnlyFieldId';

  describe('Non-persistable readonly text field', () => {
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      field_type: FIELD_TYPE,
      value: VALUE,
      display_context: 'READONLY'
    });

    let fixture: ComponentFixture<ReadTextFieldComponent>;
    let component: ReadTextFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadTextFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadTextFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided value as text', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(VALUE.toString());
    });

    it('render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual('');
    });

    it('render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual('');
    });

  });

  describe('Persistable readonly text field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = <CaseField>({
      id: FIELD_ID,
      label: 'X',
      field_type: FIELD_TYPE,
      value: VALUE,
      display_context: 'READONLY'
    });

    let fixture: ComponentFixture<ReadTextFieldComponent>;
    let component: ReadTextFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadTextFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadTextFieldComponent);
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
