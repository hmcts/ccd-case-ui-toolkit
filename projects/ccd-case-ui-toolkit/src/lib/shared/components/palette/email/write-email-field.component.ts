import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-email-field',
  templateUrl: 'write-email-field.html'
})
export class WriteEmailFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public emailControl: FormControl;

  public ngOnInit() {
    this.emailControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }
}
