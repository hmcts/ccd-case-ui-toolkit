import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-text-area-field',
  templateUrl: './write-text-area-field.html'
})
export class WriteTextAreaFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  textareaControl: FormControl;

  ngOnInit() {
    this.textareaControl = this.registerControl(new FormControl(this.caseField.value));
  }
}
