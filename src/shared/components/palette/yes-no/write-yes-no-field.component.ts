import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { YesNoService } from './yes-no.service';

@Component({
  selector: 'ccd-write-yes-no-field',
  templateUrl: './write-yes-no-field.html'
})
export class WriteYesNoFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  yesNoValues = [ 'Yes', 'No' ];
  yesNoControl: FormControl;

  constructor(private yesNoService: YesNoService) {
    super();
  }

  ngOnInit() {
    this.yesNoControl = this.registerControl(new FormControl(this.yesNoService.format(this.caseField.value))) as FormControl;
  }

  public inputBlur() {
    this.yesNoControl.markAsUntouched();
  }

}
