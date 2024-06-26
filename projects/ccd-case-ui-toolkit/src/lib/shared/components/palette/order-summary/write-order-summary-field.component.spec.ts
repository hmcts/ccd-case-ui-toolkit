import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { text } from '../../../test/helpers';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { MoneyGbpInputComponent, ReadMoneyGbpFieldComponent } from '../money-gbp';
import { OrderSummary } from './order-summary.model';
import { ReadOrderSummaryFieldComponent } from './read-order-summary-field.component';
import { ReadOrderSummaryRowComponent } from './read-order-summary-row.component';
import { WriteOrderSummaryFieldComponent } from './write-order-summary-field.component';

describe('WriteOrderSummaryFieldComponent', () => {
  const FIELD_TYPE: FieldType = {
    id: 'PersonOrderSummary',
    type: 'Complex'
  };

  const VALUE: OrderSummary = {
    PaymentReference: 'RC-1521-1095-0964-3143',
    Fees: [
      {
        value: {
          FeeCode: 'FEE0001',
          FeeAmount: '4545',
          FeeDescription: 'First fee description',
          FeeVersion: '1'
        }
      },
      {
        value: {
          FeeCode: 'FEE0002',
          FeeAmount: '0455',
          FeeDescription: 'Second fee description',
          FeeVersion: '2'
        }
      }
    ],
    PaymentTotal: '5000'
  };

  const EXPECTED_FEE_AMOUNTS = ['£45.45', '£4.55'];
  const EXPECTED_PAYMENT_TOTAL = '£50.00';
  const ID = 'PersonOrderSummary';
  const CASE_FIELD: CaseField = ({
    id: ID,
    label: 'X',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE,
    value: VALUE
  }) as CaseField;
  const UNDEFINED_CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE,
    value: undefined
  }) as CaseField;
  const NULL_CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'MANDATORY',
    field_type: FIELD_TYPE,
    value: null
  }) as CaseField;

  const $HEAD_ROW = By.css('table>thead>tr');
  const $BODY = By.css('table>tbody');

  describe('Value exists', () => {
    let fixture: ComponentFixture<WriteOrderSummaryFieldComponent>;
    let component: WriteOrderSummaryFieldComponent;
    let de: DebugElement;

    const FORM_GROUP: FormGroup = new FormGroup({});

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
          ],
          declarations: [
            MoneyGbpInputComponent,
            WriteOrderSummaryFieldComponent,
            ReadMoneyGbpFieldComponent,
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
            // Mocks
            MockRpxTranslatePipe
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(WriteOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      component.formGroup = FORM_GROUP;
      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided order summary as a table', () => {
      const headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(4);
      expect(text(headRow.children[1])).toBe('Code');
      expect(text(headRow.children[2])).toBe('Description');
      expect(text(headRow.children[3])).toBe('Amount');

      const body = de.query($BODY);
      expect(body.children.length).toEqual(VALUE.Fees.length + 1);

      for (let i = 1; i <= VALUE.Fees.length; i++) {

        const feeCode = text(de.query(By.css(`table>tbody tr:nth-child(${i}) td:nth-child(1)`)));
        const feeDescription = text(de.query(By.css(`table>tbody tr:nth-child(${i}) td:nth-child(2)`)));
        const feeAmount = text(de.query(By.css(`table>tbody tr:nth-child(${i}) td:nth-child(3)`)));

        expect(feeCode).toBe(VALUE.Fees[i - 1].value.FeeCode);
        expect(feeDescription).toBe(VALUE.Fees[i - 1].value.FeeDescription);
        expect(feeAmount).toBe(EXPECTED_FEE_AMOUNTS[i - 1]);
      }

      const paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')));
      expect(paymentTotalLabel).toBe('Total');

      const paymentTotalValue = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')));
      expect(paymentTotalValue).toBe(EXPECTED_PAYMENT_TOTAL);
    });
  });

  describe('Undefined value', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});

    let fixture: ComponentFixture<ReadOrderSummaryFieldComponent>;
    let component: ReadOrderSummaryFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
          ],
          declarations: [
            MoneyGbpInputComponent,
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
            MockRpxTranslatePipe
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = UNDEFINED_CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render undefined case field value as empty table with column headers and Total rows only', () => {
      const headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(4);
      expect(text(headRow.children[1])).toBe('Code');
      expect(text(headRow.children[2])).toBe('Description');
      expect(text(headRow.children[3])).toBe('Amount');

      const body = de.query($BODY);
      expect(body.children.length).toBe(1);

      const paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')));
      expect(paymentTotalLabel).toBe('Total');

      const paymentTotal = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')));
      expect(paymentTotal).toBeNull();
    });
  });

  describe('Null value', () => {
    const FORM_GROUP: FormGroup = new FormGroup({});

    let fixture: ComponentFixture<ReadOrderSummaryFieldComponent>;
    let component: ReadOrderSummaryFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
          ],
          declarations: [
            MoneyGbpInputComponent,
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
            MockRpxTranslatePipe
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = NULL_CASE_FIELD;
      component.formGroup = FORM_GROUP;

      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render null case field value as empty table with column headers and Total rows only', () => {
      const headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(4);
      expect(text(headRow.children[1])).toBe('Code');
      expect(text(headRow.children[2])).toBe('Description');
      expect(text(headRow.children[3])).toBe('Amount');

      const body = de.query($BODY);

      expect(body.children.length).toBe(1);

      const paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')));
      expect(paymentTotalLabel).toBe('Total');

      const paymentTotal = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')));
      expect(paymentTotal).toBeNull();
    });
  });
});
