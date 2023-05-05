import { Component, OnInit } from '@angular/core';
import { AbstractFieldWriteComponent } from '../base-field/abstract-field-write.component';

@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
})
export class WriteQueryManagementFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  constructor() {
    super();
  }

  public ngOnInit(): void {

  }
}
