import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadDateFieldComponent } from './read-date-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { DatePipe } from '../utils/date.pipe';
import { FormGroup } from '@angular/forms';

describe('ReadDateFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'Date'
  };
  const VALUE = '1800-07-15';
  describe('Non-persistable readonly date field', () => {
    const CASE_FIELD: CaseField = {
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    };
    const FORMATTED_VALUE = '15 Jul 1800';
    const EMPTY = '';

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should render output with date pipe formatting', () => {
      component.caseField.value = VALUE;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(FORMATTED_VALUE);
    });

    it('should render empty string value as empty string', () => {
      component.caseField.value = '';
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('should render undefined value as empty string', () => {
      component.caseField.value = undefined;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });

    it('should render null value as empty string', () => {
      component.caseField.value = null;
      fixture.detectChanges();

      expect(de.nativeElement.textContent).toEqual(EMPTY);
    });
  });

  describe('Persistable readonly date field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const REGISTER_CONTROL = (control) => {
      FORM_GROUP.addControl(FIELD_ID, control);
      return control;
    };
    const CASE_FIELD: CaseField = {
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    };
    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
      component = fixture.componentInstance;

      component.registerControl = REGISTER_CONTROL;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls[FIELD_ID]).toBeTruthy();
      expect(FORM_GROUP.controls[FIELD_ID].value).toBe(VALUE);
    });

  });

});
