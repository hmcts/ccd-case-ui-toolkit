import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { FormatTranslatorService } from '../../../services/case-fields/format-translator.service';
import { DatePipe } from '../utils/date.pipe';
import { ReadDateFieldComponent } from './read-date-field.component';

describe('ReadDateFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Date',
    type: 'Date'
  };
  const VALUE = '1800-07-15';
  describe('Non-persistable readonly date field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    const FORMATTED_VALUE = '15 Jul 1800';
    const EMPTY = '';

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe,
          ],
          providers: [FormatTranslatorService]
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
    const CASE_FIELD: CaseField = ({
      id: FIELD_ID,
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadDateFieldComponent>;
    let component: ReadDateFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {

      TestBed
        .configureTestingModule({
          declarations: [
            ReadDateFieldComponent,
            DatePipe
          ],
          providers: [FormatTranslatorService]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadDateFieldComponent);
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
