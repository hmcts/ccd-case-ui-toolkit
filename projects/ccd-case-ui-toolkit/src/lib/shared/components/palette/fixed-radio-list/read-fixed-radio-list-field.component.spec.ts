import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { FixedRadioListPipe } from './fixed-radio-list.pipe';
import { ReadFixedRadioListFieldComponent } from './read-fixed-radio-list-field.component';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';

describe('ReadFixedRadioListFieldComponent', () => {

  const VALUE = 'F';
  const EXPECTED_LABEL = 'Female';
  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'Gender',
    type: 'FixedRadioList',
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
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;
    const EMPTY = '';

    let fixture: ComponentFixture<ReadFixedRadioListFieldComponent>;
    let component: ReadFixedRadioListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadFixedRadioListFieldComponent,
            FixedRadioListPipe,
            MockRpxTranslatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadFixedRadioListFieldComponent);
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
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadFixedRadioListFieldComponent>;
    let component: ReadFixedRadioListFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadFixedRadioListFieldComponent,
            FixedRadioListPipe,
            MockRpxTranslatePipe
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadFixedRadioListFieldComponent);
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
