import { Component, ChangeDetectionStrategy } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-case-history-viewer-field',
  templateUrl: 'case-history-viewer-field.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CaseHistoryViewerFieldComponent extends AbstractFieldReadComponent {}
