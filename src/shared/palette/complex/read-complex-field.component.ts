import { Component } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { PaletteContext } from '../base-field/palette-context.enum';

@Component({
  selector: 'ccd-read-complex-field',
  templateUrl: './read-complex-field.html',
})
export class ReadComplexFieldComponent extends AbstractFieldReadComponent {

  public paletteContext = PaletteContext;
}
