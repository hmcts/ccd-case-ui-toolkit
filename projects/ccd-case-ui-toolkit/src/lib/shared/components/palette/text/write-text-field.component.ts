import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-text-field',
  templateUrl: './write-text-field.html'
})
export class WriteTextFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public textControl: FormControl;

  public ngOnInit() {
    this.textControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  public onBlur($event) {
    $event.target.value = $event.target.value.trim();
  }
}
