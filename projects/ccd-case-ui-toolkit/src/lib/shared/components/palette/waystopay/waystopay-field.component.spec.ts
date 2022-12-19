import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MockComponent } from 'ng2-mock-component';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldType } from '../../../domain/definition/field-type.model';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WaysToPayFieldComponent } from '../waystopay/waystopay-field.component';

const FIELD_ID = 'CaseWaysToPay';
const FIELD_TYPE: FieldType = {
  id: 'WaysToPay',
  type: 'WaysToPay'
};
const VALUE = '';
const CASE_FIELD: CaseField = ({
  id: FIELD_ID,
  label: 'X',
  field_type: FIELD_TYPE,
  value: VALUE,
  display_context: 'OPTIONAL'
}) as CaseField;

const FORM_GROUP: FormGroup = new FormGroup({});

const APP_CONFIG: AbstractAppConfig = {
    load: async () => {},
    getLoginUrl: () => 'loginUrl',
    getApiUrl: () => 'apiUrl',
    getCaseDataUrl: () => 'caseDataUrl',
    getDocumentManagementUrl: () => 'documentManagementUrl',
    getDocumentManagementUrlV2: () => 'documentManagementUrlV2',
    getDocumentSecureMode: () => true,
    getRemoteDocumentManagementUrl: () => 'remoteDocumentManagementUrl',
    getHrsUrl: () => 'hrsUrl',
    getRemoteHrsUrl: () => 'remoteHrsUrl',
    getAnnotationApiUrl: () => 'annotationApiUrl',
    getPostcodeLookupUrl: () => 'postcodeLookupUrl',
    getOAuth2ClientId: () => 'oauth2clientId',
    getPaymentsUrl: () => 'paymentsUrl',
    getPayBulkScanBaseUrl: () => 'payBulkScanBaseUrl',
    getCreateOrUpdateDraftsUrl: () => 'createOrUpdateDraftsUrl',
    getViewOrDeleteDraftsUrl: () => 'viewOrDeleteDraftsUrl',
    getActivityBatchCollectionDelayMs: () => 1000,
    getActivityMaxRequestPerBatch: () => 10,
    getActivityNexPollRequestMs: () => 30000,
    getActivityRetry: () => 3,
    getActivityUrl: () => 'activityUrl',
    getCaseHistoryUrl: () => 'caseHistoryUrl',
    getPrintServiceUrl: () => 'printServiceUrl',
    getRemotePrintServiceUrl: () => 'remotePrintServiceUrl',
    getPaginationPageSize: () => 25,
    getBannersUrl: () => 'bannersUrl',
    getPrdUrl: () => 'prdUrl',
    getCacheTimeOut: () => 30000,
    getRefundsUrl: () => 'refundsUrl',
    getWorkAllocationApiUrl: () => 'workAllocationApiUrl',
    getUserInfoApiUrl: () => 'userInfoApiUrl',
    getAccessManagementBasicViewMock: () => ({}),
    getAccessManagementMode: () => true,
    getAccessManagementRequestReviewMockModel: () => ({}),
    getCamRoleAssignmentsApiUrl: () => 'camRoleAssignmentsApiUrl',
    getLocationRefApiUrl: () => 'locationRefApiUrl',
    getPaymentReturnUrl: () => 'paymentReturnUrl',
    getCategoriesAndDocumentsUrl: () => 'categoriesAndDocumentsUrl',
    getDocumentDataUrl: () => 'documentDataUrl',
    getCaseFlagsRefdataApiUrl: () => 'caseFlagsRefdataApiUrl',
    getRDCommonDataApiUrl: () => 'rd_common_data_api_url',
    getCaseDataStoreApiUrl: () => 'case_data_store_api_url',
    getWAServiceConfig: () => 'waServiceConfig'
  };

  let PaymentWebComponent;

describe('Ways To Pay Component', () => {

    let fixture: ComponentFixture<WaysToPayFieldComponent>;
    let component: WaysToPayFieldComponent;
    let de: DebugElement;

    beforeEach(waitForAsync(() => {
        PaymentWebComponent = MockComponent({ selector: 'ccpay-payment-lib', inputs: [
            'API_ROOT',
            'CCD_CASE_NUMBER',
            'BULKSCAN_API_ROOT',
            'ISBSENABLE',
            'SELECTED_OPTION',
            'VIEW',
            'REFUNDS_API_ROOT',
            'TAKEPAYMENT',
            'SERVICEREQUEST',
            'PAYMENT_GROUP_REF',
            'EXC_REFERENCE',
            'DCN_NUMBER',
            'LOGGEDINUSERROLES',
            'CARDPAYMENTRETURNURL'
          ]});

        TestBed
          .configureTestingModule({
            imports: [
              ReactiveFormsModule,
              PaletteUtilsModule
            ],
            declarations: [
              WaysToPayFieldComponent,

              // Mocks
              PaymentWebComponent
            ],
            providers: [
                { provide: AbstractAppConfig, useValue: APP_CONFIG },
                SessionStorageService
            ]
          })
          .compileComponents();

        fixture = TestBed.createComponent(WaysToPayFieldComponent);
        component = fixture.componentInstance;

        component.caseField = CASE_FIELD;
        component.formGroup = FORM_GROUP;

        de = fixture.debugElement;
        fixture.detectChanges();
      }));

      it('Returns correct base url', () => {
          expect(component.getBaseURL()).toEqual('paymentsUrl');
      });

      it('returns correct bulkscan url', () => {
          expect(component.getPayBulkScanBaseURL()).toEqual('payBulkScanBaseUrl');
      });

      it('returns correct refunds url', () => {
          expect(component.getRefundsUrl()).toEqual('refundsUrl');
      });

      it('returns empty roles when not initialized', () => {
          expect(component.getUserRoles().length).toBe(0);
      });

      it('returns empty email when not initialized', () => {
          expect(component.getUserEmail()).toEqual('');
      });
});
