import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { take } from 'rxjs/operators';
import {
  CaseEventTrigger
} from '../../../../../../../../lib/shared/domain';
import { CaseNotifier } from '../../../../../case-editor/services';
import { RaiseQueryErrorMessage } from '../../../enums';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListData, QueryListItem } from '../../../models';
import { QueryManagementService } from '../../../services';
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
  @Input() public triggerSubmission: boolean;
  @Input() public eventData: CaseEventTrigger | null = null;

  @Output() public queryDataCreated = new EventEmitter <QmCaseQueriesCollection>();
  @Output() public hasRespondedToQueryTask: EventEmitter<boolean> = new EventEmitter();

  public readonly queryCreateContextEnum = QueryCreateContext;
  public readonly raiseQueryErrorMessages = RaiseQueryErrorMessage;
  public caseId: string;
  public queryItemId: string;
  public caseDetails;
  public queryResponseStatus: string;
  public queryListData: QueryListItem | undefined;

  public hasRespondedToQuery: boolean = false;
  public messgaeId: string;

  private static readonly QUERY_ITEM_RESPOND = '3';
  private static readonly QUERY_ITEM_FOLLOWUP = '4';

  constructor(private readonly caseNotifier: CaseNotifier,
    private readonly route: ActivatedRoute,
    private queryManagementService: QueryManagementService) {}

  public ngOnInit(): void {
    this.queryItemId = this.route.snapshot.params.qid;
    this.caseId = this.route.snapshot.params.cid;
    this.caseNotifier.fetchAndRefresh(this.caseId).pipe(take(1)).subscribe({
      next: (caseDetails) => {
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

    const caseQueriesCollections = this.caseQueriesCollections.find(
      (collection) => collection?.caseMessages.find((c) => c.value.id === messageId)
    );

    const queryWithChildren = new QueryListData(caseQueriesCollections);
    const targetId = this.queryItemId === QueryWriteRespondToQueryComponent.QUERY_ITEM_RESPOND
      ? (matchingMessage?.parentId || matchingMessage?.id)
      : matchingMessage?.id;

    this.queryListData = queryWithChildren?.queries.find((query) => query?.id === targetId);
    this.queryResponseStatus = this.queryListData?.responseStatus;
    const isCollectionDataSet = this.setCaseQueriesCollectionData();
    if (isCollectionDataSet) {
      if (this.triggerSubmission) {
        const data = this.generateCaseQueriesCollectionData();
        this.queryDataCreated.emit(data);
      }
    }
  }

  public hasResponded(value: boolean): void {
    this.hasRespondedToQuery = value;
    this.hasRespondedToQueryTask.emit(value);
  }

  public setCaseQueriesCollectionData(): boolean {
    if (!this.eventData) {
      console.warn('Event data not available; skipping collection setup.');
      return false;
    }

    this.queryManagementService.setCaseQueriesCollectionData(
      this.eventData,
      this.queryCreateContext,
      this.caseDetails,
      this.messgaeId
    );

    return true;
  }

  private generateCaseQueriesCollectionData(): QmCaseQueriesCollection {
    return this.queryManagementService.generateCaseQueriesCollectionData(
      this.formGroup,
      this.queryCreateContext,
      this.queryItem,
      this.messgaeId
    );
  }
}
