import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractFieldReadComponent } from '../base-field';
import { QueryListItem } from './models';

@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
  styleUrls: ['./write-query-management-field.component.scss']
})
export class WriteQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public queryItem: QueryListItem;
  public formGroup: FormGroup = new FormGroup({});

  constructor() {
    super();
  }

  public ngOnInit() {}
}
