import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { ReadPhoneUKFieldComponent } from './read-phone-uk-field.component';

describe('ReadPhoneUKFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'PhoneUK',
    type: 'PhoneUK'
  };
  const VALUE = '07123456789';
  const EMPTY = '';

  describe('Non-persistable readonly phone-uk field', () => {
  const CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
    value: VALUE
  }) as CaseField;

    let fixture: ComponentFixture<ReadPhoneUKFieldComponent>;
    let component: ReadPhoneUKFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadPhoneUKFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadPhoneUKFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided phone number as string', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(VALUE);
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

  describe('Persistable readonly phone-uk field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadPhoneUKFieldComponent>;
    let component: ReadPhoneUKFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadPhoneUKFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadPhoneUKFieldComponent);
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
