import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SessionStorageService } from '../../../../../services';
import { QueryListItem } from '../../models';
import { Constants } from '../../../../../commons/constants';
import { QueryItemResponseStatus } from '../../enums';
@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss']
})
export class QueryDetailsComponent implements OnChanges{
  @Input() public query: QueryListItem;
  @Input() public caseId: string;
  @Input() public queryResponseStatus: string;

  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  @Output() public hasResponded: EventEmitter<boolean> = new EventEmitter();

  public showItem: boolean = true;
  public message: string;

  private static readonly QUERY_ITEM_RESPOND = '3';
  private queryItemId: string;

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly route: ActivatedRoute,
    private readonly router: Router) { }

  public onBack(): void {
    this.backClicked.emit(true);
  }

  public isCaseworker(): boolean {
    const userDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    return userDetails && userDetails.roles
      && !(userDetails.roles.includes('pui-case-manager')
        || userDetails.roles.some((role) => role.toLowerCase().includes('judge')));
  }

  public ngOnChanges(): void {
    this.toggleLinkVisibility();
    this.hasRespondedToQuery();
  }

  public toggleLinkVisibility(): void {
    this.queryItemId = this.route.snapshot.params.qid;
    this.showItem = this.queryItemId !== QueryDetailsComponent.QUERY_ITEM_RESPOND;
  }

  public hasRespondedToQuery(): boolean {
    if (this.queryResponseStatus === undefined || this.queryResponseStatus === QueryItemResponseStatus.AWAITING) {
      this.hasResponded.emit(false);
      return false;
    }

    if (this.isCaseworker() && this.queryResponseStatus !== QueryItemResponseStatus.AWAITING) {
      this.message = Constants.TASK_COMPLETION_ERROR;
      this.hasResponded.emit(true);
      return true;
    }

    this.hasResponded.emit(false);
    return false;
  }
}
