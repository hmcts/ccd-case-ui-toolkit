import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CaseView } from '../../../../../../domain';
import { QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html',
  styleUrls: ['./query-write-respond-to-query.component.scss']
})
export class QueryWriteRespondToQueryComponent implements OnInit {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  @Input() public caseView: CaseView;

  public ngOnInit() {
    this.formGroup = new FormGroup({
      response: new FormControl('', Validators.required),
      documents: new FormControl([], Validators.required)
    });
  }
}
