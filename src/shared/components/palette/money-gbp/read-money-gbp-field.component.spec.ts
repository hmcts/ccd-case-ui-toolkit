import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadMoneyGbpFieldComponent } from './read-money-gbp-field.component';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FormGroup } from '@angular/forms';

describe('ReadMoneyGBPFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'MoneyGBP',
    type: 'MoneyGBP'
  };
  const VALUE = 4220;

  describe('Non-persistable readonly textarea field', () => {
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });

    let fixture: ComponentFixture<ReadMoneyGbpFieldComponent>;
    let component: ReadMoneyGbpFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadMoneyGbpFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadMoneyGbpFieldComponent);
      component = fixture.componentInstance;

      component.amount = undefined;
      component.caseField = CASE_FIELD;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    describe('from caseField value', () => {
      it('should render provided value as GBP currency', () => {
        component.caseField.value = VALUE;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£42.20');
      });

      it('should prefix pences with leading 0.', () => {
        component.caseField.value = 20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£0.20');
      });

      it('should format large number with commas', () => {
        component.caseField.value = 420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£4,200,000.20');
      });

      it('should render undefined value as empty string', () => {
        component.caseField.value = undefined;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });

      it('should render null value as empty string', () => {
        component.caseField.value = null;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });

      it('should render unsupported values as empty string', () => {
        component.caseField.value = 'bugger off, you who is reading that';
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });
    });

    describe('from template value', () => {
      it('should render provided value as GBP currency', () => {
        component.amount = VALUE;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£42.20');
      });

      it('should prefix pences with leading 0.', () => {
        component.amount = 20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£0.20');
      });

      it('should format large number with commas', () => {
        component.amount = 420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£4,200,000.20');
      });

      it('should render undefined value as empty string', () => {
        component.amount = undefined;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });

      it('should render null value as empty string', () => {
        component.amount = null;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });

      it('should render unsupported values as empty string', () => {
        component.amount = 'bugger off, you who is reading that';
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });
    });
  });

  describe('Persistable readonly textarea field', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});
    const CASE_FIELD: CaseField = <CaseField>({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    });

    let fixture: ComponentFixture<ReadMoneyGbpFieldComponent>;
    let component: ReadMoneyGbpFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [],
          declarations: [
            ReadMoneyGbpFieldComponent
          ],
          providers: []
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadMoneyGbpFieldComponent);
      component = fixture.componentInstance;

      component.amount = undefined;
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
