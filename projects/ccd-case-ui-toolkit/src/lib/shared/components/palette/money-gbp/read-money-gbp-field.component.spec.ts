import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { CaseField, FieldType } from '../../../domain';
import { ReadMoneyGbpFieldComponent } from './read-money-gbp-field.component';

describe('ReadMoneyGBPFieldComponent', () => {

  const FIELD_ID = 'ReadOnlyFieldId';
  const FIELD_TYPE: FieldType = {
    id: 'MoneyGBP',
    type: 'MoneyGBP'
  };
  const VALUE = 4220;

  describe('Non-persistable readonly textarea field', () => {
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadMoneyGbpFieldComponent>;
    let component: ReadMoneyGbpFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
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

      it('should render provided negative value as GBP currency', () => {
        component.caseField.value = -4220;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£42.20');
      });

      it('should prefix pences with leading 0.', () => {
        component.caseField.value = 20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£0.20');
      });

      it('should prefix negative pences with leading 0.', () => {
        component.caseField.value = -20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£0.20');
      });

      it('should format large number with commas', () => {
        component.caseField.value = 420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£4,200,000.20');
      });

      it('should format large negative number with commas', () => {
        component.caseField.value = -420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£4,200,000.20');
      });

      it('should render undefined value as empty string', () => {
        component.amount = null;
        component.caseField.value = undefined;
        fixture.detectChanges();
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('');
      });

      it('should render null value as empty string', () => {
        component.amount = null;
        component.caseField.value = null;
        fixture.detectChanges();
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

      it('should render provided negative value as GBP currency', () => {
        component.amount = -4220;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£42.20');
      });

      it('should prefix pences with leading 0.', () => {
        component.amount = 20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£0.20');
      });

      it('should prefix negative pences with leading 0.', () => {
        component.amount = -20;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£0.20');
      });

      it('should format large number with commas', () => {
        component.amount = 420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('£4,200,000.20');
      });

      it('should format negative large number with commas', () => {
        component.amount = -420000020;
        component.ngOnInit();
        fixture.detectChanges();

        expect(de.nativeElement.textContent).toEqual('-£4,200,000.20');
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
    const CASE_FIELD: CaseField = ({
      id: 'x',
      label: 'X',
      display_context: 'OPTIONAL',
      field_type: FIELD_TYPE,
      value: VALUE
    }) as CaseField;

    let fixture: ComponentFixture<ReadMoneyGbpFieldComponent>;
    let component: ReadMoneyGbpFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
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
      component = fixture.componentInstance as ReadMoneyGbpFieldComponent;

      component.amount = 0;
      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('should register readonly case field value with form group', () => {
      expect(FORM_GROUP.controls['x']).toBeTruthy();
      expect(FORM_GROUP.controls['x'].value).toBe(VALUE);
    });

  });

});
