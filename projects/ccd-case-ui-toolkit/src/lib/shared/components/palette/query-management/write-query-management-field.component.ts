import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AbstractFieldReadComponent } from '../base-field';
import { partyMessagesMockData } from './__mocks__';
import { QueryListItem } from './models';

@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
  styleUrls: ['./write-query-management-field.component.scss']
})
export class WriteQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public queryItem: QueryListItem;
  public showSummary: boolean = false;
  public formGroup: FormGroup = new FormGroup({});

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.queryItem = new QueryListItem();
    Object.assign(this.queryItem, partyMessagesMockData[0].partyMessages[0]);
  }

  public showResponseForm(): void {
    this.showSummary = false;
  }

  public confirmDetails(): void {
    this.showSummary = true;
  }
}
