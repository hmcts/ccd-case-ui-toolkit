import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { Component, OnInit } from '@angular/core';
import { YesNoService } from './yes-no.service';

@Component({
  selector: 'ccd-read-yes-no-field',
  template: `<span class="text-16">{{formattedValue}}</span>`
})
export class ReadYesNoFieldComponent extends AbstractFieldReadComponent implements OnInit {

  formattedValue: string;

  constructor(private yesNoService: YesNoService) {
    super();
  }

  ngOnInit() {
    this.formattedValue = this.yesNoService.format(this.caseField.value);
  }

}
