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

@Component({
  selector: 'toolkit-test-host',
  imports: [PaletteModule, CaseEditorModule, ReactiveFormsModule, JsonPipe],
  template: `
    <main>
      <h1>Toolkit date input</h1>
      <ccd-write-date-container-field [caseField]="field" [formGroup]="form" />
      <p>Form value: <output data-testid="date-value">{{ form.get(field.id)?.value }}</output></p>
      <p>Form status: <output data-testid="date-status">{{ form.status }}</output></p>
      <p>Form errors: <output data-testid="date-errors">{{ form.get(field.id)?.errors | json }}</output></p>
    </main>
  `
})
class ToolkitTestHost {
  readonly field = dateField;
  readonly form = new FormGroup({ [dateField.id]: new FormControl(dateField.value) });
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
