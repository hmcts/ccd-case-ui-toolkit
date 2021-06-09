import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'ccd-write-phone-uk-field',
  templateUrl: './write-phone-uk-field.html'
})
export class WritePhoneUKFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  phoneUkControl: FormControl;

  ngOnInit() {
    this.phoneUkControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }

  public inputBlur() {
    this.phoneUkControl.markAsUntouched();
  }

}
