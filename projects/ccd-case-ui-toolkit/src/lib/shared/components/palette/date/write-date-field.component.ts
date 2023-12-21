import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-date-field',
  templateUrl: './write-date-field.html'
})
export class WriteDateFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  public dateControl: FormControl;

  public ngOnInit() {
    this.dateControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  public isDateTime(): boolean {
    return this.caseField.field_type.id === 'DateTime';
  }

}
