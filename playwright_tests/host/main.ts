import { PaymentLibModule } from '@hmcts/ccpay-web-component';
import { AbstractAppConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app.config';
import { AppMockConfig } from '../../projects/ccd-case-ui-toolkit/src/lib/app-config.mock';
import { AsyncPipe, CommonModule, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Component, importProvidersFrom } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { of } from 'rxjs';
import { RpxTranslationConfig, RpxTranslationModule } from 'rpx-xui-translation';
import { AlertMessageType, AlertService, CaseEditorModule, CaseNotifier, PaletteModule, CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { BannersModule } from '../../projects/ccd-case-ui-toolkit/src/lib/components/banners/banners.module';
import { CasesService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/case-editor/services/cases.service';
import { dateField, dateTimeField } from '../mocks/date-field.mock';
import { mandatoryFields } from '../mocks/mandatory-fields.mock';
import { moneyField } from '../mocks/money-field.mock';
import { collectionField, restrictedCollectionField } from '../mocks/collection-field.mock';
import { editorFields } from '../mocks/editor-fields.mock';
import { advancedFields } from '../mocks/advanced-fields.mock';
import { orderSummaryField, paymentHistoryField } from '../mocks/viewer-payment.mock';
import { identityFields } from '../mocks/identity-fields.mock';
import { structuredFields } from '../mocks/structured-fields.mock';
import { caseFileLauncher, caseFlagsLauncher, caseHistoryField, launcherRouteCase, queryManagementLauncher, unsupportedLauncher, waysToPayField } from '../mocks/launchers.mock';
import { CaseFileViewService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/case-file-view/case-file-view.service';
import { DocumentManagementService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/document-management/document-management.service';
import { WindowService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/window/window.service';
import { HttpErrorService } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/services/http/http-error.service';
import { categoriesAndDocumentsTestData } from '../../projects/ccd-case-ui-toolkit/src/lib/shared/components/palette/case-file-view/test-data/categories-and-documents-test-data';
import { fieldFormFields } from '../mocks/field-form.mock';
import { caseNotifierCases } from '../mocks/case-notifier.mock';
import { ReferenceIdentityControlsComponent } from './reference-identity-controls.component';

const launcherCaseReference = '1111222233334444';
const caseFileViewService: Pick<CaseFileViewService, 'getCategoriesAndDocuments'> = {
  getCategoriesAndDocuments: (caseReference) => caseReference === launcherCaseReference ? of(categoriesAndDocumentsTestData) : (() => { throw new Error(`Unexpected case reference: ${caseReference}`); })()
};
const documentManagementService: Pick<DocumentManagementService, 'getDocumentBinaryUrl' | 'getMediaViewerInfo' | 'isHtmlDocument'> = {
  getDocumentBinaryUrl: (document) => document.document_binary_url,
  getMediaViewerInfo: (document) => JSON.stringify(document),
  isHtmlDocument: () => false
};
const windowService: Pick<WindowService, 'openOnNewTab'> = {
  openOnNewTab: () => undefined
};
const httpErrorService: Pick<HttpErrorService, 'handle'> = {
  handle: () => {
    throw new Error('The launcher test host does not make HTTP requests');
  }
};
const launcherRoute = { snapshot: { params: { cid: launcherCaseReference }, paramMap: { get: (key: string) => key === 'cid' ? launcherCaseReference : null }, data: { case: launcherRouteCase } } };

const caseNotifierCasesService: Pick<CasesService, 'getCaseViewV2'> = {
  getCaseViewV2: (caseId) => of(caseNotifierCases[caseId])
};

@Component({
  selector: 'toolkit-test-host',
  imports: [CommonModule, AsyncPipe, PaletteModule, CaseEditorModule, BannersModule, ReactiveFormsModule, JsonPipe, ReferenceIdentityControlsComponent],
  template: `
    <main>
      <h1>Toolkit date input</h1>
      <ccd-write-date-container-field [caseField]="field" [formGroup]="dateForm" />
      <p>Form value: <output data-testid="date-value">{{ dateForm.get(field.id)?.value }}</output></p>
      <p>Form status: <output data-testid="date-status">{{ dateForm.status }}</output></p>
      <p>Form errors: <output data-testid="date-errors">{{ dateForm.get(field.id)?.errors | json }}</output></p>
      <ccd-write-date-container-field [caseField]="dateTimeField" [formGroup]="dateTimeForm" />
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
      <ccd-write-fixed-list-field [caseField]="mandatory.fixedList" [formGroup]="mandatoryForm" />
      <ccd-write-fixed-radio-list-field [caseField]="mandatory.fixedRadio" [formGroup]="mandatoryForm" />
      <ccd-write-multi-select-list-field [caseField]="mandatory.multiSelect" [formGroup]="mandatoryForm" />
      <output data-testid="mandatory-status">{{ mandatoryForm.status }}</output>
      <output data-testid="mandatory-values">{{ mandatoryForm.value | json }}</output>

      <h2>Advanced field controls</h2>
      <ccd-write-text-field [caseField]="advanced.postcode" [formGroup]="advancedForm" />
      <ccd-write-rich-text-area-field [caseField]="advanced.richText" [formGroup]="advancedForm" />
      <ccd-write-dynamic-list-field [caseField]="advanced.dynamicList" [formGroup]="advancedForm" />
      <ccd-write-dynamic-radio-list-field [caseField]="advanced.dynamicRadio" [formGroup]="advancedForm" />
      <ccd-write-dynamic-multi-select-list-field [caseField]="advanced.dynamicMulti" [formGroup]="advancedForm" />
      <output data-testid="advanced-values">{{ advancedForm.value | json }}</output>
      <output data-testid="advanced-status">{{ advancedForm.status }}</output>
      <div data-testid="structured-fields"><h2>Structured field controls</h2>
      <ccd-field-write [caseField]="structured.complex" [formGroup]="structuredForm" />
      <ccd-field-write [caseField]="structured.requiredComplex" [formGroup]="structuredForm" />
      <output data-testid="structured-values">{{ structuredForm.value | json }}</output>
      <output data-testid="structured-status">{{ structuredForm.status }}</output></div>

      <h2>Launcher and mini-application controls</h2>
      <ccd-field-read [caseField]="caseFileLauncher" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="waysToPay" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="unsupportedLauncher" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="caseFlagsLauncher" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="queryManagementLauncher" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="caseHistory" [caseReference]="caseReference" />

      <h2>Viewer and payment controls</h2>
      <ccd-read-order-summary-field [caseField]="orderSummary" [caseReference]="caseReference" />
      <ccd-field-read [caseField]="paymentHistory" [caseReference]="caseReference" />
      <div data-testid="field-form-fields"><h2>Field form controls</h2>
      <ccd-field-write [caseField]="fieldForm.required" [formGroup]="fieldFormGroup" />
      <ccd-field-write [caseField]="fieldForm.optional" [formGroup]="fieldFormGroup" />
      <ccd-field-read [caseField]="fieldForm.readOnly" [formGroup]="fieldFormGroup" />
      </div>
      <output data-testid="field-form-values">{{ fieldFormGroup.value | json }}</output>
      <output data-testid="field-form-status">{{ fieldFormGroup.status }}</output>

      <h2>Identity read-only controls</h2>
      <ccd-read-case-link-field [caseField]="identity.caseLink" />
      <ccd-label-field [caseField]="identity.label" [caseFields]="[]" />
      <ccd-write-text-field [caseField]="identityMixed" [formGroup]="identityForm" />
      <output data-testid="identity-mixed-value">{{ identityForm.value | json }}</output>

      <h2>Reference identity controls</h2>
      <toolkit-reference-identity-controls />

      <h2>Case notifier state</h2>
      <button type="button" (click)="refreshChallengedCase()">Refresh challenged case</button>
      <button type="button" (click)="refreshStandardCase()">Refresh standard case</button>
      <output data-testid="case-notifier-state">{{ caseNotifierState }}</output>

      <h2>Collection controls</h2>
      <ccd-write-collection-field [caseField]="names" [formGroup]="collectionForm" />
      <div data-testid="restricted-collection">
        <ccd-write-collection-field [caseField]="restrictedNames" [formGroup]="collectionForm" />
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
  readonly caseFileLauncher = caseFileLauncher;
  readonly waysToPay = waysToPayField;
  readonly unsupportedLauncher = unsupportedLauncher;
  readonly caseFlagsLauncher = caseFlagsLauncher;
  readonly queryManagementLauncher = queryManagementLauncher;
  readonly caseHistory = caseHistoryField;
  readonly orderSummary = orderSummaryField;
  readonly paymentHistory = paymentHistoryField;
  readonly caseReference = launcherCaseReference;
  readonly identity = identityFields;
  readonly identityMixed = Object.assign(new CaseField(), { id: 'identity-mixed', label: 'Editable note', display_context: 'OPTIONAL', field_type: { id: 'Text', type: 'Text' }, value: null });
  readonly identityForm = new FormGroup({});
  caseNotifierState = 'No case selected';
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
  readonly alertMessageType = AlertMessageType;

  constructor(readonly alertService: AlertService, readonly caseNotifier: CaseNotifier) {
    this.caseNotifier.caseView.subscribe((caseView) => {
      if (caseView.case_id === launcherCaseReference) {
        return;
      }
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
    { provide: AbstractAppConfig, useClass: AppMockConfig },
    provideNoopAnimations(),
    provideRouter([]),
    { provide: ActivatedRoute, useValue: launcherRoute },
    AlertService,
    { provide: CasesService, useValue: caseNotifierCasesService },
    { provide: CaseFileViewService, useValue: caseFileViewService },
    { provide: DocumentManagementService, useValue: documentManagementService },
    { provide: WindowService, useValue: windowService },
    { provide: HttpErrorService, useValue: httpErrorService },
    importProvidersFrom(
      PaymentLibModule,
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
      RpxTranslationModule.forRoot(new RpxTranslationConfig())
    )
  ]
}).catch((error) => console.error(error));
