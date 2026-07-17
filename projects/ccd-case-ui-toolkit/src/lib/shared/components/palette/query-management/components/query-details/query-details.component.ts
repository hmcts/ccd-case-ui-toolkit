import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { SessionStorageService } from '../../../../../services';
import { isInternalUser } from '../../../../../utils';
import { QueryItemResponseStatus } from '../../enums';
import { QueryCreateContext, QueryListItem } from '../../models';
import { CaseNotifier } from '../../../../case-editor/services/case.notifier';
import { AbstractAppConfig } from '../../../../../../app.config';
import { Subscription } from 'rxjs';

@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss'],
  standalone: false
})
export class QueryDetailsComponent implements OnChanges, OnInit, OnDestroy {
  @Input() public query: QueryListItem;
  @Input() public caseId: string;
  @Input() public queryResponseStatus: string;

  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() public hasResponded: EventEmitter<boolean> = new EventEmitter();

  public showItem: boolean = true;

  private static readonly QUERY_ITEM_RESPOND = '3';
  private static readonly QUERY_ITEM_FOLLOW_UP = '4';
  private queryItemId: string;

  public followUpQuery: string = QueryCreateContext.FOLLOWUP;
  public respondToQuery: string = QueryCreateContext.RESPOND;
  public hmctsStaff: string = QueryCreateContext.HMCTSSTAFF;
  public enableServiceSpecificMultiFollowups: string[];
  public currentJurisdictionId: string;
  public isMultipleFollowUpEnabled: boolean = false;

  private caseSubscription: Subscription;

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly abstractConfig: AbstractAppConfig,
    private readonly caseNotifier: CaseNotifier) { }

  public onBack(): void {
    this.backClicked.emit(true);
  }

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public ngOnInit(): void {
    this.enableServiceSpecificMultiFollowups = this.abstractConfig.getEnableServiceSpecificMultiFollowups() || [];

    this.caseSubscription = this.caseNotifier.caseView.subscribe((caseView) => {
      if (caseView?.case_type?.jurisdiction?.id) {
        this.currentJurisdictionId = caseView.case_type.jurisdiction.id;
        this.isMultipleFollowUpEnabled = this.enableServiceSpecificMultiFollowups.includes(this.currentJurisdictionId);

        this.hasRespondedToQuery();
      }
    });
  }

  public ngOnChanges(): void {
    this.toggleLinkVisibility();
    this.hasRespondedToQuery();
  }

  public ngOnDestroy(): void {
    this.caseSubscription?.unsubscribe();
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

    const lastChild = this.query?.children?.[this.query.children.length - 1];
    const lastMessageType = this.query?.children?.length
      ? this.query.children[this.query.children.length - 1]?.messageType
      : this.query?.messageType;

    const isFollowUp = lastMessageType === this.followUpQuery;
    const isRespond = lastChild?.messageType === this.respondToQuery;

    if (this.queryResponseStatus === QueryItemResponseStatus.CLOSED) {
      this.hasResponded.emit(true);
      return true;
    }

    if (isFollowUp && this.isMultipleFollowUpEnabled) {
      this.hasResponded.emit(false);
      return false;
    }

    if (isRespond) {
      this.hasResponded.emit(false);
      return false;
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
