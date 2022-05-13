import { Component, Input } from '@angular/core';
import { CaseField } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';

@Component({
  selector: 'ccd-read-case-link-field',
  templateUrl: 'read-case-link-field.html'
})
export class ReadCaseLinkFieldComponent extends AbstractFieldReadComponent {

  public paletteContext = PaletteContext;

  public hasReference(): boolean {
    return this.caseField.value && this.caseField.value.CaseReference;
  }

  public hasCaseLinkCollection(): boolean {
    return this.caseField.field_type && this.caseField.field_type.collection_field_type.id === 'CaseLink'
  }
}
