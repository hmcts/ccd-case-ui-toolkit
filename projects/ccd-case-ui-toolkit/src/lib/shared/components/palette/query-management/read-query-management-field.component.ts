import { Component, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';

@Component({
  selector: 'ccd-read-query-management-field',
  templateUrl: './read-query-management-field.component.html',
})
export class ReadQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {

  constructor() {
    super();
  }

  public ngOnInit(): void {

  }
}
