import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionStorageService } from '../../../../../services';
import { isInternalUser } from '../../../../../utils';
import { QueryItemResponseStatus } from '../../enums';
import { QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss']
})
export class QueryDetailsComponent implements OnChanges, OnInit{
  @Input() public query: QueryListItem;
  @Input() public caseId: string;
  @Input() public queryResponseStatus: string;

  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() public hasResponded: EventEmitter<boolean> = new EventEmitter();

  public showItem: boolean = true;

  private static readonly QUERY_ITEM_RESPOND = '3';
  private static readonly QUERY_ITEM_FOLLOW_UP = '4';
  private static readonly YES = 'Yes';
  private queryItemId: string;

  public isQueryClosed: boolean = false;

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router) { }

  public onBack(): void {
    this.backClicked.emit(true);
  }

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public ngOnInit(): void {
    this.isQueryClosed = this.query?.children?.some((queryItem) => queryItem?.isClosed === QueryDetailsComponent.YES);
  }

  public ngOnChanges(): void {
    this.toggleLinkVisibility();
    this.hasRespondedToQuery();
  }

  public toggleLinkVisibility(): void {
    this.queryItemId = this.route.snapshot.params.qid as string;
    if (this.queryItemId === QueryDetailsComponent.QUERY_ITEM_RESPOND || this.queryItemId === QueryDetailsComponent.QUERY_ITEM_FOLLOW_UP) {
      this.showItem = false;
    }
  }

  public hasRespondedToQuery(): boolean {
    const isAwaiting = this.queryResponseStatus === undefined || this.queryResponseStatus === QueryItemResponseStatus.AWAITING;
    if (this.queryResponseStatus === QueryItemResponseStatus.CLOSED) {
      this.hasResponded.emit(true);
      return true;
    }

    if (this.isInternalUser()) {
      if (isAwaiting) {
        this.hasResponded.emit(false);
        return false;
      }

      this.hasResponded.emit(true);
      return true;
    }

    if (isAwaiting) {
      this.hasResponded.emit(true);
      return false; // Don't show message
    }

    this.hasResponded.emit(false);
    return false;
  }
}
