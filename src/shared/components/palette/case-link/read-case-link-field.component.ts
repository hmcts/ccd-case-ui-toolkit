import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-case-link-field',
  templateUrl: 'read-case-link-field.html'
})
export class ReadCaseLinkFieldComponent extends AbstractFieldReadComponent {

  getCaseReference(): string {
    if (this.caseField && this.caseField.value) {
      return this.caseField.value.CaseReference;
    }
    return null;
  }

}
