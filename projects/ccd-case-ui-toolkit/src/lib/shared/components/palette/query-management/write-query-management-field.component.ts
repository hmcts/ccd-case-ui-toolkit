import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseView } from '../../../domain';
import { AbstractFieldReadComponent } from '../base-field';
import { QueryListItem } from './models';
import { CaseNotifier } from '../../case-editor';

@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
  styleUrls: ['./write-query-management-field.component.scss']
})
export class WriteQueryManagementFieldComponent extends AbstractFieldReadComponent implements OnInit {
  public queryItem: QueryListItem;
  public formGroup: FormGroup = new FormGroup({});

  constructor(public caseNotifierService: CaseNotifier) {
    super();
  }

  public ngOnInit(): void {
    console.log(this);
    // this.queryItem = new QueryListItem();
    // Object.assign(this.queryItem, partyMessagesMockData[0].partyMessages[0]);
  }
}
