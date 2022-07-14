import { Input, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';

import { AbstractFormFieldComponent } from './abstract-form-field.component';
import { PaletteContext } from './palette-context.enum';

export abstract class AbstractFieldReadComponent extends AbstractFormFieldComponent implements OnInit {

  @Input()
  public caseReference: string;

  @Input()
  public topLevelFormGroup: FormGroup | AbstractControl;

  /**
   * Optional. Enable context-aware rendering of fields.
   */
  @Input()
  public context: PaletteContext = PaletteContext.DEFAULT;

  public ngOnInit(): void {
    if (!this.caseField.metadata) {
      this.registerControl(new FormControl(this.caseField.value));
    }
  }

}
