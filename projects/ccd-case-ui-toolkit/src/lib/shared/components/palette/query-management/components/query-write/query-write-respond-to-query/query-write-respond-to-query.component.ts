import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
  @Input() public showForm;
  @Output() public hasRespondedToQueryTask: EventEmitter<boolean> = new EventEmitter();

  public readonly queryCreateContextEnum = QueryCreateContext;
  public readonly raiseQueryErrorMessages = RaiseQueryErrorMessage;
  public caseId: string;
  public queryItemId: string;
  public caseDetails;
  public queryResponseStatus: string;
  public queryItemDisplay: QueryListItem;

  public hasRespondedToQuery: boolean = false;

  private static readonly QUERY_ITEM_RESPOND = '3';
  private static readonly QUERY_ITEM_FOLLOWUP = '4';

  constructor(private readonly caseNotifier: CaseNotifier,
    private readonly route: ActivatedRoute) {}

  public ngOnInit(): void {
    this.queryItemId = this.route.snapshot.params.qid;
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
    if (!this.caseQueriesCollections || this.caseQueriesCollections.length === 0) {
    // Silent return – this is not an error.
      return;
    }

    if (!this.caseQueriesCollections[0]) {
      console.error('caseQueriesCollections[0] is undefined!', this.caseQueriesCollections);
      return;
    }

    const messageId = this.route.snapshot.params?.dataid;
    if (!messageId) {
      console.warn('No messageId found in route params:', this.route.snapshot.params);
      return;
    }

    const allMessages = this.caseQueriesCollections
      .flatMap((caseData) => caseData?.caseMessages || []);

    const matchingMessage = allMessages.find(
      (message) => message?.value?.id === messageId
    )?.value;

    if (!matchingMessage) {
      console.warn('No matching message found for ID:', messageId);
      return;
    }

    const queryWithChildren = new QueryListData(this.caseQueriesCollections[0]);

    let filteredQuery = [];

    if (this.queryItemId === QueryWriteRespondToQueryComponent.QUERY_ITEM_RESPOND) {
      if (matchingMessage?.parentId) {
        filteredQuery = queryWithChildren.queries.filter(
          (query) => query?.id === matchingMessage.parentId
        );
      } else {
        filteredQuery = queryWithChildren.queries.filter(
          (query) => query?.id === matchingMessage.id
        );
      }

      this.queryItemDisplay = new QueryListItem();
      Object.assign(this.queryItemDisplay, matchingMessage);
      this.queryItem = this.queryItemDisplay;
    } else {
      filteredQuery = queryWithChildren.queries.filter(
        (query) => query?.id === matchingMessage.id
      );
    }

    this.queryResponseStatus = filteredQuery[0]?.responseStatus;
  }

  public hasResponded(value: boolean): void {
    this.hasRespondedToQuery = value;
    this.hasRespondedToQueryTask.emit(value);
  }
}
