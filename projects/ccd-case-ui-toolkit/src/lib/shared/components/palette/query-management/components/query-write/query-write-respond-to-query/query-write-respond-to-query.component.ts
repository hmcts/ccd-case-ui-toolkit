import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import { CaseNotifier } from '../../../../../case-editor/services';
import { RaiseQueryErrorMessage } from '../../../enums';
import { CaseQueriesCollection, QueryCreateContext, QueryListData, QueryListItem } from '../../../models';
@Component({
  selector: 'ccd-query-write-respond-to-query',
  templateUrl: './query-write-respond-to-query.component.html',
  styleUrls: ['./query-write-respond-to-query.component.scss']
})

export class QueryWriteRespondToQueryComponent implements OnInit, OnChanges {
  @Input() public queryItem: QueryListItem;
  @Input() public formGroup: FormGroup;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public submitted = false;
  @Input() public caseQueriesCollections: CaseQueriesCollection[];
  @Output() public hasRespondedToQueryTask: EventEmitter<boolean> = new EventEmitter();

  public readonly queryCreateContextEnum = QueryCreateContext;
  public readonly raiseQueryErrorMessages = RaiseQueryErrorMessage;
  public caseId: string;
  public caseDetails;
  public totalNumberOfQueryChildren: number;

  public hasRespondedToQuery: boolean = false;

  constructor(private readonly caseNotifier: CaseNotifier) { }

  public ngOnInit(): void {
    this.caseNotifier.caseView.pipe(take(1)).subscribe({
      next: (caseDetails) => {
        this.caseId = caseDetails?.case_id ?? '';
        this.caseDetails = caseDetails;
      },
      error: (err) => {
        console.error('Error retrieving case details:', err);
      }
    });
  }

  public ngOnChanges(): void {
    const numberOfQueryChildren = new QueryListData(this.caseQueriesCollections[0]);
    this.totalNumberOfQueryChildren = numberOfQueryChildren.queries[0].children.length;
  }

  public hasResponded(value: boolean): void {
    this.hasRespondedToQuery = value;
    this.hasRespondedToQueryTask.emit(value);
  }
}
