import { Input } from '@angular/core';
import { CaseField } from '../../domain/definition/case-field.model';
import { PaletteContext } from './palette-context.enum';

export class AbstractFieldReadComponent {

  @Input()
  caseField: CaseField;

  @Input()
  caseReference: string;

  /**
   * Optional. Enable context-aware rendering of fields.
   */
  @Input()
  context: PaletteContext = PaletteContext.DEFAULT;
}
