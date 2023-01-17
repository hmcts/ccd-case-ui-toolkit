import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-phone-uk-field',
  templateUrl: './write-phone-uk-field.html'
})
export class WritePhoneUKFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public phoneUkControl: FormControl;

  public ngOnInit() {
    this.phoneUkControl = this.registerControl(new FormControl(this.caseField.value)) as FormControl;
  }
}
