import { JsonPipe } from '@angular/common';
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
import { dateField } from '../mocks/date-field.mock';
import { mandatoryFields } from '../mocks/mandatory-fields.mock';
import { moneyField } from '../mocks/money-field.mock';

@Component({
  selector: 'toolkit-test-host',
  imports: [PaletteModule, CaseEditorModule, ReactiveFormsModule, JsonPipe],
  template: `
    <main>
      <h1>Toolkit date input</h1>
      <ccd-write-date-container-field [caseField]="field" [formGroup]="dateForm" />
      <p>Form value: <output data-testid="date-value">{{ dateForm.get(field.id)?.value }}</output></p>
      <p>Form status: <output data-testid="date-status">{{ dateForm.status }}</output></p>
      <p>Form errors: <output data-testid="date-errors">{{ dateForm.get(field.id)?.errors | json }}</output></p>

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
    </main>
  `
})
class ToolkitTestHost {
  readonly field = dateField;
  readonly mandatory = mandatoryFields;
  readonly dateForm = new FormGroup({ [dateField.id]: new FormControl(dateField.value) });
  readonly mandatoryForm = new FormGroup({});
  readonly money = moneyField;
  readonly moneyForm = new FormGroup({});
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
