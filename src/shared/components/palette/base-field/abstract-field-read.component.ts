import { Input, OnInit } from '@angular/core';
import { PaletteContext } from './palette-context.enum';
import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { FormControl } from '@angular/forms';

export abstract class AbstractFieldReadComponent extends AbstractFormFieldComponent  {

  @Input()
  caseReference: string;

  /**
   * Optional. Enable context-aware rendering of fields.
   */
  @Input()
  context: PaletteContext = PaletteContext.DEFAULT;

}
