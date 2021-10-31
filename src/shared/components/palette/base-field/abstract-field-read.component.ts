import { Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { PaletteContext } from './palette-context.enum';

export abstract class AbstractFieldReadComponent extends AbstractFormFieldComponent implements OnInit {

  @Input()
  caseReference: string;

  @Input()
  topLevelFormGroup: FormGroup;

  /**
   * Optional. Enable context-aware rendering of fields.
   */
  @Input()
  context: PaletteContext = PaletteContext.DEFAULT;

  ngOnInit(): void {
    if (!this.caseField.metadata) {
      this.registerControl(new FormControl(this.caseField.value));
    }
  }

}
