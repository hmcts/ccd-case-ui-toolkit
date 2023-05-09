import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';
import { YesNoService } from './yes-no.service';

@Component({
  selector: 'ccd-write-yes-no-field',
  templateUrl: './write-yes-no-field.html'
})
export class WriteYesNoFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  public yesNoValues = [ 'Yes', 'No' ];
  public yesNoControl: FormControl;

  constructor(private readonly yesNoService: YesNoService) {
    super();
  }

  public ngOnInit() {
    this.yesNoControl = this.registerControl(new FormControl(this.yesNoService.format(this.caseField.value))) as FormControl;
  }

  public toLowerCase(value: string) {
    return value.toLowerCase();
  }
}
