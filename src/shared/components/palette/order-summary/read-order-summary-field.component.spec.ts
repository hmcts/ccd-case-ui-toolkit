import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadOrderSummaryFieldComponent } from './read-order-summary-field.component';
import { OrderSummary } from './order-summary.model';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { By } from '@angular/platform-browser';
import { text } from '../../../test/helpers';
import { ReadOrderSummaryRowComponent } from './read-order-summary-row.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MoneyGbpModule } from '../money-gbp/money-gbp.module';

describe('ReadOrderSummaryFieldComponent', () => {

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
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'READONLY',
    field_type: FIELD_TYPE,
    value: VALUE
  };
  const UNDEFINED_CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'READONLY',
    field_type: FIELD_TYPE,
    value: undefined
  };
  const NULL_CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'READONLY',
    field_type: FIELD_TYPE,
    value: null
  };

  const $HEAD_ROW = By.css('table>thead>tr');
  const $BODY = By.css('table>tbody');

  describe('Value exists', () => {
    let fixture: ComponentFixture<ReadOrderSummaryFieldComponent>;
    let component: ReadOrderSummaryFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            MoneyGbpModule
          ],
          declarations: [
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = CASE_FIELD;
      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render provided order summary as a table', () => {

      let headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(3);
      expect(text(headRow.children[0])).toBe('Code');
      expect(text(headRow.children[1])).toBe('Description');
        expect(text(headRow.children[2])).toBe('Amount');

        let body = de.query($BODY);
        expect(body.children.length).toEqual(VALUE.Fees.length + 1);

        for (let i = 1; i <= VALUE.Fees.length; i++) {

          let feeCode = text(de.query(By.css('table>tbody tr:nth-child(' + i + ') td:nth-child(1)')));
          let feeDescription = text(de.query(By.css('table>tbody tr:nth-child(' + i + ') td:nth-child(2)')));
          let feeAmount = text(de.query(By.css('table>tbody tr:nth-child(' + i + ') td:nth-child(3)')));

          expect(feeCode).toBe(VALUE.Fees[i - 1].value.FeeCode);
          expect(feeDescription).toBe(VALUE.Fees[i - 1].value.FeeDescription);
          expect(feeAmount).toBe(EXPECTED_FEE_AMOUNTS[i - 1]);
        }

        let paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')))
        expect(paymentTotalLabel).toBe('Total');

        let paymentTotalValue = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')))
        expect(paymentTotalValue).toBe(EXPECTED_PAYMENT_TOTAL);

      });
  });

  describe('Undefined value', () => {
    let fixture: ComponentFixture<ReadOrderSummaryFieldComponent>;
    let component: ReadOrderSummaryFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            MoneyGbpModule
          ],
          declarations: [
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = UNDEFINED_CASE_FIELD;
      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render undefined case field value as empty table with column headers and Total rows only', () => {
      let headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(3);
      expect(text(headRow.children[0])).toBe('Code');
      expect(text(headRow.children[1])).toBe('Description');
      expect(text(headRow.children[2])).toBe('Amount');

      let body = de.query($BODY);
      expect(body.children.length).toBe(1);

      let paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')))
      expect(paymentTotalLabel).toBe('Total');

      let paymentTotal = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')))
      expect(paymentTotal).toBeNull();
    });
  });

  describe('Null value', () => {
    let fixture: ComponentFixture<ReadOrderSummaryFieldComponent>;
    let component: ReadOrderSummaryFieldComponent;
    let de: DebugElement;

    beforeEach(async(() => {
      TestBed
        .configureTestingModule({
          imports: [
            ReactiveFormsModule,
            MoneyGbpModule
          ],
          declarations: [
            ReadOrderSummaryFieldComponent,
            ReadOrderSummaryRowComponent,
          ]
        })
        .compileComponents();

      fixture = TestBed.createComponent(ReadOrderSummaryFieldComponent);
      component = fixture.componentInstance;

      component.caseField = NULL_CASE_FIELD;
      de = fixture.debugElement;
      fixture.detectChanges();
    }));

    it('render null case field value as empty table with column headers and Total rows only', () => {
      let headRow = de.query($HEAD_ROW);
      expect(headRow.children.length).toBe(3);
      expect(text(headRow.children[0])).toBe('Code');
      expect(text(headRow.children[1])).toBe('Description');
      expect(text(headRow.children[2])).toBe('Amount');

      let body = de.query($BODY);

      expect(body.children.length).toBe(1);

      let paymentTotalLabel = text(de.query(By.css('table>tbody tr:last-child td:nth-child(2)')))
      expect(paymentTotalLabel).toBe('Total');

      let paymentTotal = text(de.query(By.css('table>tbody tr:last-child td:nth-child(3)')))
      expect(paymentTotal).toBeNull();
    });
  });
});
