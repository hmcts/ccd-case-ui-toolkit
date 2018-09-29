import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../domain/definition/field-type.model';
import { CaseField } from '../../domain/definition/case-field.model';
import { CasePaymentHistoryViewerFieldComponent } from './case-payment-history-viewer-field.component';
import { AppConfig } from '../../app.config';
import { MockComponent } from 'ng2-mock-component';
import { By } from '@angular/platform-browser';
import createSpyObj = jasmine.createSpyObj;

describe('CasePaymentHistoryViewerFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'CasePaymentHistoryViewer',
    type: 'CasePaymentHistoryViewer'
  };
  const CASE_FIELD: CaseField = {
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
  };
  const CASE_REFERENCE = '1234123412341234';
  const PAYMENTS_URL = 'http://payment-api:123';

  let appConfig;
  let PaymentWebComponent;

  let fixture: ComponentFixture<CasePaymentHistoryViewerFieldComponent>;
  let component: CasePaymentHistoryViewerFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    appConfig = createSpyObj<AppConfig>('AppConfig', ['getPaymentsUrl']);
    appConfig.getPaymentsUrl.and.returnValue(PAYMENTS_URL);

    PaymentWebComponent = MockComponent({ selector: 'ccpay-payment-lib', inputs: [
        'API_ROOT',
        'CCD_CASE_NUMBER'
      ]});

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CasePaymentHistoryViewerFieldComponent,

          // Mocks
          PaymentWebComponent
        ],
        providers: [
          { provide: AppConfig, useValue: appConfig },
        ]
      })
      .compileComponents();

    fixture = TestBed.createComponent(CasePaymentHistoryViewerFieldComponent);
    component = fixture.componentInstance;

    component.caseField = CASE_FIELD;
    component.caseReference = CASE_REFERENCE;

    de = fixture.debugElement;
    fixture.detectChanges();
  }));

  it('should render Payments web component', () => {
    let paymentDe = de.query(By.directive(PaymentWebComponent));

    expect(paymentDe).toBeDefined();

    let paymentComponent = paymentDe.componentInstance;
    expect(paymentComponent.API_ROOT).toEqual(PAYMENTS_URL);
    expect(paymentComponent.CCD_CASE_NUMBER).toEqual(CASE_REFERENCE);
  });
});
