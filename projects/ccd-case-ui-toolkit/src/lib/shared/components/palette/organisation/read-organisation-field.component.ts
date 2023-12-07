import { Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../domain/definition';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';

@Component({
  selector: 'ccd-read-organisation-field',
  templateUrl: './read-organisation-field.html',
})
export class ReadOrganisationFieldComponent extends AbstractFieldReadComponent implements OnInit {
  @Input()
  public caseFields: CaseField[] = [];

  public paletteContext = PaletteContext;

  public ngOnInit(): void {
    super.ngOnInit();
    if (this.caseField.display_context_parameter) {
      this.context = PaletteContext.TABLE_VIEW;
    }
  }

}
