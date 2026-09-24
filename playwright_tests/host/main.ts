import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { AbstractAppConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app.config';
import { AppMockConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app-config.mock';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Component, importProvidersFrom } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { RpxTranslationConfig, RpxTranslationModule } from 'rpx-xui-translation';
import { AlertMessageType, AlertService, CaseEditorModule, CaseNotifier, PaletteModule, CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { BannersModule } from '../../projects/ccd-case-ui-toolkit/src/lib/components/banners/banners.module';
import { CasesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/cases.service';
import { AddressesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/addresses/addresses.service';
import { DocumentManagementService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/document-management/document-management.service';
import { JurisdictionService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/jurisdiction/jurisdiction.service';
import { CaseFileViewService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/case-file-view/case-file-view.service';
import { LoadingService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/loading/loading.service';
import { SessionStorageService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/session/session-storage.service';
import { WindowService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/window/window.service';
import { dateField, dateTimeField } from '../mocks/date-field.mock';
import { mandatoryFields } from '../mocks/mandatory-fields.mock';
import { moneyField } from '../mocks/money-field.mock';
import { collectionField, restrictedCollectionField } from '../mocks/collection-field.mock';
import { editorFields } from '../mocks/editor-fields.mock';
import { advancedFields } from '../mocks/advanced-fields.mock';
import { orderSummaryField, paymentHistoryField } from '../mocks/viewer-payment.mock';
import { identityFields } from '../mocks/identity-fields.mock';
import { structuredFields } from '../mocks/structured-fields.mock';
import { fieldFormFields } from '../mocks/field-form.mock';
import { caseNotifierCases } from '../mocks/case-notifier.mock';
import { ReferenceIdentityControlsComponent } from './reference-identity-controls.component';
import { addressDocumentFields } from '../mocks/address-document.mock';

const caseNotifierCasesService: Pick<CasesService, 'getCaseViewV2'> = {
  getCaseViewV2: (caseId) => of(caseNotifierCases[caseId])
};

const mandatoryAddressError = new BehaviorSubject(false);
const addressesService: Pick<AddressesService, 'getMandatoryError' | 'getAddressesForPostcode'> = {
  getMandatoryError: () => mandatoryAddressError.asObservable(),
  getAddressesForPostcode: () => of([{
    AddressLine1: '1 Test Street',
    AddressLine2: '',
    AddressLine3: '',
    PostTown: 'London',
    County: '',
    PostCode: 'SW1A 1AA',
    Country: 'United Kingdom'
  } as any])
};

const caseFileViewService: Pick<CaseFileViewService, 'getCategoriesAndDocuments' | 'updateDocumentCategory'> = {
  getCategoriesAndDocuments: () => of({ case_version: 1, categories: [] } as any),
  updateDocumentCategory: () => of(null)
};

const testAppConfig = Object.assign(new AppMockConfig(), {
  getPaymentsUrl: () => window.location.origin,
  getPayBulkScanBaseUrl: () => window.location.origin,
  getRefundsUrl: () => window.location.origin,
  getNotificationUrl: () => window.location.origin
});

const documentManagementService: Pick<DocumentManagementService, 'parseCaseInfo' | 'isDocumentSecureModeEnabled' | 'uploadFile' | 'getDocumentBinaryUrl' | 'isHtmlDocument' | 'getMediaViewerInfo'> = {
  parseCaseInfo: () => null,
  isDocumentSecureModeEnabled: () => false,
  uploadFile: (data: FormData) => (data.get('files') as File | null)?.name === 'fail.pdf'
    ? throwError(() => ({ status: 502 }))
    : of({ _embedded: { documents: [{ _links: { self: { href: 'https://document.example/documents/uploaded' }, binary: { href: 'https://document.example/documents/uploaded/binary' } }, originalDocumentName: 'uploaded.pdf' }] } } as any),
  getDocumentBinaryUrl: (value: any) => value.document_binary_url,
  isHtmlDocument: () => false,
  getMediaViewerInfo: () => '{}'
};

@Component({
  selector: 'toolkit-test-host',
  providers: [
    { provide: AddressesService, useValue: addressesService },
    { provide: DocumentManagementService, useValue: documentManagementService },
    { provide: JurisdictionService, useValue: {} },
    { provide: CaseFileViewService, useValue: caseFileViewService },
    { provide: LoadingService, useValue: { register: () => 'test-loading', unregister: () => undefined } },
    { provide: SessionStorageService, useValue: { getItem: () => JSON.stringify({ roles: 'caseworker', sub: 'caseworker@example.invalid' }) } },
    { provide: WindowService, useValue: { openOnNewTab: () => undefined } }
  ],
  imports: [CommonModule, AsyncPipe, PaletteModule, CaseEditorModule, BannersModule, ReactiveFormsModule, JsonPipe, ReferenceIdentityControlsComponent],
  template: `
    <main>
      <h1>Toolkit date input</h1>
      <ccd-field-write [caseField]="field" [formGroup]="dateForm" />
      <p>Form value: <output data-testid="date-value">{{ dateForm.get(field.id)?.value }}</output></p>
      <p>Form status: <output data-testid="date-status">{{ dateForm.status }}</output></p>
      <p>Form errors: <output data-testid="date-errors">{{ dateForm.get(field.id)?.errors | json }}</output></p>
      <ccd-field-write [caseField]="dateTimeField" [formGroup]="dateTimeForm" />
      <p>Form value: <output data-testid="date-time-value">{{ dateTimeForm.get(dateTimeField.id)?.value }}</output></p>
      <p>Form status: <output data-testid="date-time-status">{{ dateTimeForm.status }}</output></p>

      <h2>Mandatory field controls</h2>
      <ccd-write-money-gbp-field [caseField]="money" [formGroup]="moneyForm" />
      <output data-testid="money-value">{{ moneyForm.get(money.id)?.value }}</output>
      <output data-testid="money-status">{{ moneyForm.status }}</output>
      <ccd-write-text-field [caseField]="mandatory.text" [formGroup]="mandatoryForm" />
      <ccd-write-number-field [caseField]="mandatory.number" [formGroup]="mandatoryForm" />
      <ccd-write-email-field [caseField]="mandatory.email" [formGroup]="mandatoryForm" />
      <ccd-write-phone-uk-field [caseField]="mandatory.phone" [formGroup]="mandatoryForm" />
      <ccd-write-text-area-field [caseField]="mandatory.textArea" [formGroup]="mandatoryForm" />
      <ccd-write-yes-no-field [caseField]="mandatory.yesNo" [formGroup]="mandatoryForm" />
      <ccd-field-write [caseField]="mandatory.fixedList" [formGroup]="mandatoryForm" />
      <ccd-write-fixed-radio-list-field [caseField]="mandatory.fixedRadio" [formGroup]="mandatoryForm" />
      <ccd-write-multi-select-list-field [caseField]="mandatory.multiSelect" [formGroup]="mandatoryForm" />
      <output data-testid="mandatory-status">{{ mandatoryForm.status }}</output>
      <output data-testid="mandatory-values">{{ mandatoryForm.value | json }}</output>

      <section data-testid="advanced-fields"><h2>Advanced field controls</h2>
      <ccd-write-text-field [caseField]="advanced.postcode" [formGroup]="advancedForm" />
      <ccd-write-rich-text-area-field [caseField]="advanced.richText" [formGroup]="advancedForm" />
      <ccd-field-write [caseField]="advanced.dynamicList" [formGroup]="advancedForm" />
      <ccd-write-dynamic-radio-list-field [caseField]="advanced.dynamicRadio" [formGroup]="advancedForm" />
      <ccd-write-dynamic-multi-select-list-field [caseField]="advanced.dynamicMulti" [formGroup]="advancedForm" />
      <output data-testid="advanced-values">{{ advancedForm.value | json }}</output>
      <output data-testid="advanced-status">{{ advancedForm.status }}</output>
      </section>
      <section data-testid="palette-dispatch"><h2>Palette dispatch</h2>
        <div data-testid="palette-component-launcher-read"><ccd-field-read [caseField]="componentLauncher" /></div>
        <div data-testid="palette-component-launcher-write"><ccd-field-write [caseField]="componentLauncher" [formGroup]="paletteDispatchForm" /></div>
        <div data-testid="palette-unsupported-read"><ccd-field-read [caseField]="unsupported" /></div>
        <div data-testid="palette-unsupported-write"><ccd-field-write [caseField]="unsupported" [formGroup]="paletteDispatchForm" /></div>
        <div data-testid="palette-unknown-launcher-read"><ccd-field-read [caseField]="unknownLauncher" /></div>
        <div data-testid="palette-unknown-launcher-write"><ccd-field-write [caseField]="unknownLauncher" [formGroup]="paletteDispatchForm" /></div>
      </section>

      <div data-testid="address-document-fields"><h2>Address and document lifecycle</h2>
      <section data-testid="address-uk-control"><ccd-field-write [caseField]="addressDocument.uk" [formGroup]="addressDocumentForm" /></section>
      <section data-testid="address-global-control"><ccd-field-write [caseField]="addressDocument.global" [formGroup]="addressDocumentForm" /></section>
      <section data-testid="document-control"><ccd-field-write [caseField]="addressDocument.document" [formGroup]="addressDocumentForm" /></section></div>

      <div data-testid="structured-fields"><h2>Structured field controls</h2>
      <ccd-field-write [caseField]="structured.complex" [formGroup]="structuredForm" />
      <ccd-field-write [caseField]="structured.requiredComplex" [formGroup]="structuredForm" />
      <output data-testid="structured-values">{{ structuredForm.value | json }}</output>
      <output data-testid="structured-status">{{ structuredForm.status }}</output></div>

      <h2>Viewer and payment controls</h2>
      <ccd-field-read [caseField]="orderSummary" [caseReference]="caseReference" />
      <ng-container *ngIf="showPaymentHistory">
        <ccd-field-read [caseField]="paymentHistory" [caseReference]="caseReference" />
      </ng-container>
      <div data-testid="field-form-fields"><h2>Field form controls</h2>
      <ccd-field-write [caseField]="fieldForm.required" [formGroup]="fieldFormGroup" />
      <ccd-field-write [caseField]="fieldForm.optional" [formGroup]="fieldFormGroup" />
      <ccd-field-read [caseField]="fieldForm.readOnly" [formGroup]="fieldFormGroup" />
      </div>
      <output data-testid="field-form-values">{{ fieldFormGroup.value | json }}</output>
      <output data-testid="field-form-status">{{ fieldFormGroup.status }}</output>

      <h2>Identity read-only controls</h2>
      <ccd-field-read [caseField]="identity.caseLink" />
      <ccd-field-read [caseField]="identity.label" [caseFields]="[]" />
      <ccd-write-text-field [caseField]="identityMixed" [formGroup]="identityForm" />
      <output data-testid="identity-mixed-value">{{ identityForm.value | json }}</output>

      <h2>Reference identity controls</h2>
      <toolkit-reference-identity-controls />

      <h2>Case notifier state</h2>
      <button type="button" (click)="refreshChallengedCase()">Refresh challenged case</button>
      <button type="button" (click)="refreshStandardCase()">Refresh standard case</button>
      <output data-testid="case-notifier-state">{{ caseNotifierState }}</output>

      <h2>Collection controls</h2>
      <ccd-field-write [caseField]="names" [formGroup]="collectionForm" />
      <div data-testid="restricted-collection">
        <ccd-field-write [caseField]="restrictedNames" [formGroup]="collectionForm" />
      </div>
      <output data-testid="names-value">{{ collectionForm.get(names.id)?.value | json }}</output>
      <output data-testid="collection-values">{{ collectionForm.value | json }}</output>

      <h2>Case edit form validation and state</h2>
      <ng-container *ngIf="editorPage === 1">
        <form [formGroup]="editorForm" (ngSubmit)="continueEditor()">
          <ccd-case-edit-form [fields]="editorFields" [caseFields]="editorFields" [formGroup]="editorForm" />
          <button type="submit" [disabled]="editorForm.invalid">Continue</button>
        </form>
      </ng-container>
      <ng-container *ngIf="editorPage === 2">
        <h3>Editor page 2</h3>
        <output data-testid="editor-optional-value">{{ editorForm.get('editor-optional')?.value }}</output>
      </ng-container>
      <output data-testid="editor-page">{{ editorPage }}</output>
      <output data-testid="editor-values">{{ editorForm.value | json }}</output>

      <h2>Callback error handling</h2>
      <button type="button" (click)="showCallbackError()">Simulate callback error</button>
      <button type="button" (click)="clearCallbackError()">Clear callback error</button>
      <ng-container *ngIf="alertService.errors | async as callbackError">
        <cut-alert [type]="alertMessageType.ERROR" data-testid="callback-error">
          {{ callbackError.message }}
        </cut-alert>
      </ng-container>
    </main>
  `
})
class ToolkitTestHost {
  readonly field = dateField;
  readonly dateTimeField = dateTimeField;
  readonly mandatory = mandatoryFields;
  readonly dateForm = new FormGroup({ [dateField.id]: new FormControl(dateField.value) });
  readonly dateTimeForm = new FormGroup({ [dateTimeField.id]: new FormControl(dateTimeField.value) });
  readonly mandatoryForm = new FormGroup({});
  readonly advanced = advancedFields;
  readonly advancedForm = new FormGroup({});
  readonly orderSummary = orderSummaryField;
  readonly paymentHistory = paymentHistoryField;
  readonly caseReference = '1111222233334444';
  readonly identity = identityFields;
  readonly identityMixed = Object.assign(new CaseField(), { id: 'identity-mixed', label: 'Editable note', display_context: 'OPTIONAL', field_type: { id: 'Text', type: 'Text' }, value: null });
  readonly identityForm = new FormGroup({});
  caseNotifierState = 'No case selected';
  readonly addressDocument = addressDocumentFields;
  readonly componentLauncher = Object.assign(new CaseField(), { id: 'launcher', label: 'Case file', display_context: 'OPTIONAL', display_context_parameter: '#ARGUMENT(CaseFileView,READONLY)', field_type: { id: 'ComponentLauncher', type: 'ComponentLauncher' }, value: null, acls: [] });
  readonly unsupported = Object.assign(new CaseField(), { id: 'unsupported', label: 'Unsupported', display_context: 'READONLY', field_type: { id: 'Unsupported', type: 'Unsupported' }, value: null });
  readonly unknownLauncher = Object.assign(new CaseField(), { id: 'unknown-launcher', label: 'Unknown launcher', display_context: 'READONLY', display_context_parameter: '#ARGUMENT(NotARegisteredLauncher,READONLY)', field_type: { id: 'ComponentLauncher', type: 'ComponentLauncher' }, value: null });
  readonly paletteDispatchForm = new FormGroup({});
  readonly addressDocumentForm = new FormGroup({});
  readonly structured = structuredFields;
  readonly structuredForm = new FormGroup({});
  readonly fieldForm = fieldFormFields;
  readonly fieldFormGroup = new FormGroup({});
  readonly money = moneyField;
  readonly moneyForm = new FormGroup({});
  readonly names = collectionField;
  readonly restrictedNames = restrictedCollectionField;
  readonly collectionForm = new FormGroup({});
  readonly editorFields = editorFields;
  readonly editorForm = new FormGroup({});
  editorPage = 1;
  readonly showPaymentHistory = new URLSearchParams(window.location.search).has('payment-history');
  readonly alertMessageType = AlertMessageType;

  constructor(readonly alertService: AlertService, readonly caseNotifier: CaseNotifier) {
    this.caseNotifier.caseView.subscribe((caseView) => {
      const access = caseView.metadataFields?.find((field) => field.id === '[ACCESS_PROCESS]')?.value;
      this.caseNotifierState = caseView.case_id && access
        ? `${caseView.case_id.replace(/(\d{4})(?=\d)/g, '$1-')}: ${access}`
        : 'No case selected';
    });
  }

  continueEditor(): void {
    this.editorPage = 2;
  }

  showCallbackError(): void {
    this.alertService.error({ phrase: 'The callback failed. Please try again.' });
  }

  clearCallbackError(): void {
    this.alertService.clear();
  }

  refreshChallengedCase(): void {
    this.caseNotifier.fetchAndRefresh('challenged').subscribe();
  }

  refreshStandardCase(): void {
    this.caseNotifier.fetchAndRefresh('standard').subscribe();
  }
}

bootstrapApplication(ToolkitTestHost, {
  providers: [
    provideHttpClient(),
    { provide: AbstractAppConfig, useValue: testAppConfig },
    provideNoopAnimations(),
    provideRouter([]),
    AlertService,
    { provide: CasesService, useValue: caseNotifierCasesService },
    importProvidersFrom(
      PaymentLibModule,
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
      RpxTranslationModule.forRoot(new RpxTranslationConfig())
    )
  ]
}).catch((error) => console.error(error));
