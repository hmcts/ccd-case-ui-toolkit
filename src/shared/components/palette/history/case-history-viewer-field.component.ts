import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-case-history-viewer-field',
  templateUrl: 'case-history-viewer-field.component.html',
})
export class CaseHistoryViewerFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public ngOnInit(): void {
    console.log('HISTORY CASE FIELD', this.caseField);
  }
}
