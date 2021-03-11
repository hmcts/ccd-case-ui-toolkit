import { Component, OnInit } from '@angular/core';
import { FormControl} from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-email-field',
  templateUrl: 'write-email-field.html'
})
export class WriteEmailFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  emailControl: FormControl;

  ngOnInit() {
    let notEmpty = this.caseField.value !== null && this.caseField.value !== undefined;
    this.emailControl = this.registerControl(new FormControl(notEmpty ? this.caseField.value : null)) as FormControl;
    if (this.emailControl.disabled) {
      this.emailControl.enable({emitEvent: false});
    }
  }
}
