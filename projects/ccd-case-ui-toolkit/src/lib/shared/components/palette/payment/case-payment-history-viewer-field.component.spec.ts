import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { MockComponent } from 'ng2-mock-component';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { CasePaymentHistoryViewerFieldComponent } from './case-payment-history-viewer-field.component';
import createSpyObj = jasmine.createSpyObj;

describe('CasePaymentHistoryViewerFieldComponent', () => {

  const FIELD_TYPE: FieldType = {
    id: 'CasePaymentHistoryViewer',
    type: 'CasePaymentHistoryViewer'
  };
  const CASE_FIELD: CaseField = ({
    id: 'x',
    label: 'X',
    display_context: 'OPTIONAL',
    field_type: FIELD_TYPE,
  }) as CaseField;
  const CASE_REFERENCE = '1234123412341234';
  const PAYMENTS_URL = 'http://payment-api:123';
  const BULKSCAN_API_URL = 'http://bulkscant-api:123';
  const REFUNDS_URL = 'http://refunds-api:123';
  const NOTIFICATION_URL = 'http://notification-api:123';

  let appConfig;
  let paymentWebComponent = null;

  let fixture: ComponentFixture<CasePaymentHistoryViewerFieldComponent>;
  let component: CasePaymentHistoryViewerFieldComponent;
  let de: DebugElement;

  beforeEach(waitForAsync(() => {
    appConfig = createSpyObj<AbstractAppConfig>('AppConfig', ['getPaymentsUrl', 'getPayBulkScanBaseUrl', 'getRefundsUrl', 'getNotificationUrl']);
    appConfig.getPaymentsUrl.and.returnValue(PAYMENTS_URL);
    appConfig.getPayBulkScanBaseUrl.and.returnValue(BULKSCAN_API_URL);
    appConfig.getRefundsUrl.and.returnValue(REFUNDS_URL);
    appConfig.getNotificationUrl.and.returnValue(NOTIFICATION_URL);

    paymentWebComponent = MockComponent({ selector: 'ccpay-payment-lib', inputs: [
        'API_ROOT',
        'CCD_CASE_NUMBER',
        'BULKSCAN_API_ROOT',
        'ISBSENABLE',
        'SELECTED_OPTION',
        'VIEW',
        'REFUNDS_API_ROOT',
        'NOTIFICATION_API_ROOT',
        'TAKEPAYMENT',
        'SERVICEREQUEST',
        'PAYMENT_GROUP_REF',
        'EXC_REFERENCE',
        'DCN_NUMBER',
        'LOGGEDINUSERROLES',
        'LOGGEDINUSEREMAIL',
        'ISPAYMENTSTATUSENABLED'
      ]});

    TestBed
      .configureTestingModule({
        imports: [],
        declarations: [
          CasePaymentHistoryViewerFieldComponent,

          // Mocks
          paymentWebComponent
        ],
        providers: [
          { provide: AbstractAppConfig, useValue: appConfig },
          SessionStorageService
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
    const paymentDe = de.query(By.directive(paymentWebComponent));

    expect(paymentDe).toBeDefined();

    const paymentComponent = paymentDe.componentInstance;
    expect(paymentComponent.API_ROOT).toEqual(PAYMENTS_URL);
    expect(paymentComponent.CCD_CASE_NUMBER).toEqual(CASE_REFERENCE);
    expect(paymentComponent.SELECTED_OPTION).toEqual('CCDorException');
    expect(paymentComponent.BULKSCAN_API_ROOT).toEqual(BULKSCAN_API_URL);
    expect(paymentComponent.ISBSENABLE).toEqual('true');
  });

  it('Returns correct base url', () => {
    expect(component.getBaseURL()).toEqual(PAYMENTS_URL);
});

it('returns correct bulkscan url', () => {
    expect(component.getPayBulkScanBaseURL()).toEqual(BULKSCAN_API_URL);
});

it('returns correct refunds url', () => {
    expect(component.getRefundsUrl()).toEqual(REFUNDS_URL);
});

it('returns correct notification url', () => {
  expect(component.getNotificationUrl()).toEqual(NOTIFICATION_URL);
});

it('returns empty roles when not initialized', () => {
    expect(component.getUserRoles().length).toBe(0);
});

it('returns empty email when not initialized', () => {
    expect(component.getUserEmail()).toEqual('');
});
});
