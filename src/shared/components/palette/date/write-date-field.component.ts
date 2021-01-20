import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ccd-write-date-field',
  templateUrl: './write-date-field.html'
})
export class WriteDateFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  dateControl: FormControl;

  ngOnInit() {
    this.dateControl = this.registerControl(new FormControl(this.caseField.value));
  }

  isDateTime(): boolean {
    return this.caseField.field_type.id === 'DateTime';
  }

}
