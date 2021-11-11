import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { FieldType } from '../../../domain/definition/field-type.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { CasePaymentHistoryViewerFieldComponent } from './case-payment-history-viewer-field.component';
import { MockComponent } from 'ng2-mock-component';
import { By } from '@angular/platform-browser';
import { AbstractAppConfig } from '../../../../app.config';
import createSpyObj = jasmine.createSpyObj;
import { SessionStorageService } from '../../../services/session/session-storage.service';

describe('CasePaymentHistoryViewerFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'CasePaymentHistoryViewer',
    type: 'CasePaymentHistoryViewer'
  };
  const CASE_FIELD: CaseField = <CaseField>({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
  });
  const CASE_REFERENCE = '1234123412341234';
  const PAYMENTS_URL = 'http://payment-api:123';
  const BULKSCAN_API_URL = 'http://bulkscant-api:123';

  let appConfig;
  let PaymentWebComponent;
  let sessionStorage: jasmine.SpyObj<SessionStorageService>;

  let fixture: ComponentFixture<CasePaymentHistoryViewerFieldComponent>;
  let component: CasePaymentHistoryViewerFieldComponent;
  let de: DebugElement;

  beforeEach(async(() => {
    appConfig = createSpyObj<AbstractAppConfig>('AppConfig', ['getPaymentsUrl', 'getPayBulkScanBaseUrl', 'getRefundsUrl']);
    appConfig.getPaymentsUrl.and.returnValue(PAYMENTS_URL);
    appConfig.getPayBulkScanBaseUrl.and.returnValue(BULKSCAN_API_URL);

    PaymentWebComponent = MockComponent({ selector: 'ccpay-payment-lib', inputs: [
        'API_ROOT',
        'CCD_CASE_NUMBER',
        'BULKSCAN_API_ROOT',
        'ISBSENABLE',
        'SELECTED_OPTION',
        'VIEW',
        'LOGGEDINUSERROLES',
        'LOGGEDINUSEREMAIL',
        'REFUNDS_API_ROOT'
      ]});

      sessionStorage = createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CasePaymentHistoryViewerFieldComponent,

          // Mocks
          PaymentWebComponent
        ],
        providers: [
          { provide: AbstractAppConfig, useValue: appConfig },
          { provide: SessionStorageService, useValue: sessionStorage }
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
    expect(paymentComponent.SELECTED_OPTION).toEqual('CCDorException')
    expect(paymentComponent.BULKSCAN_API_ROOT).toEqual(BULKSCAN_API_URL);
    expect(paymentComponent.ISBSENABLE).toEqual('true');
  });

  it('should return empty array for roles when not set', () => {
    let paymentComponent = fixture.componentInstance;
    sessionStorage.getItem.and.returnValue(null);
    expect(paymentComponent.getUserRoles()).toEqual([]);
    sessionStorage.getItem.and.returnValue({});
    expect(paymentComponent.getUserRoles()).toEqual([]);
    sessionStorage.getItem.and.returnValue('{"roles":["a","b"]}');
    expect(paymentComponent.getUserRoles()).toEqual(['a', 'b']);
  });

  it('should return empty string for email when not set', () => {
    let paymentComponent = fixture.componentInstance;
    sessionStorage.getItem.and.returnValue(null);
    expect(paymentComponent.getUserEmail()).toEqual('');
    sessionStorage.getItem.and.returnValue({});
    expect(paymentComponent.getUserEmail()).toEqual('');
    sessionStorage.getItem.and.returnValue('{"sub":"test@test.com"}');
    expect(paymentComponent.getUserEmail()).toEqual('test@test.com');
  });
});
