import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseReferencePipe } from '../../../pipes/case-reference';
import { ReadNumberFieldComponent } from './read-number-field.component';

describe('ReadNumberFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Number',
    type: 'Number'
  };
  const VALUE = 42;

  describe('Non-persistable readonly number field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadNumberFieldComponent>;
    let component: ReadNumberFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadNumberFieldComponent, CaseReferencePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadNumberFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided value as number', () => {
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

  describe('Persistable readonly number field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadNumberFieldComponent>;
    let component: ReadNumberFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadNumberFieldComponent, CaseReferencePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadNumberFieldComponent);
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
