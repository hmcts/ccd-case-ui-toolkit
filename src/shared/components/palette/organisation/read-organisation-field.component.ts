import { Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';
import { CaseField } from '../../../domain/definition';

@Component({
  selector: 'ccd-read-organisation-field',
  templateUrl: './read-organisation-field.html',
})
export class ReadOrganisationFieldComponent extends AbstractFieldReadComponent implements OnInit {
  @Input()
  caseFields: CaseField[] = [];

  public paletteContext = PaletteContext;

  ngOnInit(): void {
    super.ngOnInit();
    if (this.caseField.display_context_parameter) {
      this.context = PaletteContext.TABLE_VIEW;
    }
  }

}
