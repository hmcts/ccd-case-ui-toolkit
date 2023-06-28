import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { CaseNotifier } from '../../../../../case-editor/services';
import { RaiseQueryErrorMessage } from '../../../enums';
import { QueryCreateContext, QueryListItem } from '../../../models';

@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html',
  styleUrls: ['./query-write-respond-to-query.component.scss']
})

export class QueryWriteRespondToQueryComponent implements OnInit {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public submitted = false;
  public readonly queryCreateContextEnum = QueryCreateContext;
  public readonly raiseQueryErrorMessages = RaiseQueryErrorMessage;
  public caseId: string;

  constructor(private readonly caseNotifier: CaseNotifier) { }

  public ngOnInit(): void {
    this.caseNotifier.caseView.pipe(take(1)).subscribe(caseDetails => {
      this.caseId = caseDetails.case_id;
    });
  }
}
