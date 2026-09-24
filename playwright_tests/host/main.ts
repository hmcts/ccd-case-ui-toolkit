import { CommonModule, JsonPipe } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { Component, importProvidersFrom } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { RpxTranslationConfig, RpxTranslationModule } from 'rpx-xui-translation';
import { CaseEditorModule, PaletteModule } from '../../projects/ccd-case-ui-toolkit/src/public-api';
import { dateField, dateTimeField } from '../mocks/date-field.mock';
import { mandatoryFields } from '../mocks/mandatory-fields.mock';
import { moneyField } from '../mocks/money-field.mock';
import { collectionField, restrictedCollectionField } from '../mocks/collection-field.mock';
import { editorFields } from '../mocks/editor-fields.mock';
import { advancedFields } from '../mocks/advanced-fields.mock';
import { structuredFields } from '../mocks/structured-fields.mock';

@Component({
  selector: 'toolkit-test-host',
  imports: [CommonModule, PaletteModule, CaseEditorModule, ReactiveFormsModule, JsonPipe],
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
  readonly structured = structuredFields;
  readonly structuredForm = new FormGroup({});
  readonly money = moneyField;
  readonly moneyForm = new FormGroup({});
  readonly names = collectionField;
  readonly restrictedNames = restrictedCollectionField;
  readonly collectionForm = new FormGroup({});
  readonly editorFields = editorFields;
  readonly editorForm = new FormGroup({});
  editorPage = 1;

  continueEditor(): void {
    this.editorPage = 2;
  }
}

bootstrapApplication(ToolkitTestHost, {
  providers: [
    provideHttpClient(),
    provideNoopAnimations(),
    provideRouter([]),
    importProvidersFrom(
      StoreModule.forRoot({}),
      EffectsModule.forRoot([]),
      RpxTranslationModule.forRoot(new RpxTranslationConfig())
    )
  ]
}).catch((error) => console.error(error));
