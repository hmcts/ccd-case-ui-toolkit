import { Input, OnInit } from '@angular/core';
import { PaletteContext } from './palette-context.enum';
import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { FormControl } from '@angular/forms';

export abstract class AbstractFieldReadComponent extends AbstractFormFieldComponent implements OnInit {

  @Input()
  caseReference: string;

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
