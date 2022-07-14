import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { YesNoService } from './yes-no.service';

@Component({
  selector: 'ccd-read-yes-no-field',
  template: `<span class="text-16">{{formattedValue}}</span>`
})
export class ReadYesNoFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public formattedValue: string;

  constructor(private readonly yesNoService: YesNoService) {
    super();
  }

  public ngOnInit() {
    super.ngOnInit();
    this.formattedValue = this.yesNoService.format(this.caseField.value);
  }

}
