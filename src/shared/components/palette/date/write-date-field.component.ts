import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ccd-write-date-field',
  templateUrl: './write-date-field.html'
})
export class WriteDateFieldComponent extends AbstractFieldWriteComponent {

  dateControl: FormControl;

  isDateTime(): boolean {
    return this.caseField.field_type.id === 'DateTime';
  }

}
