import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractFormFieldComponent } from '../base-field/abstract-form-field.component';

@Component({
  selector: 'ccd-write-date-container-field',
  templateUrl: './write-date-container-field.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class WriteDateContainerFieldComponent extends AbstractFormFieldComponent {}
