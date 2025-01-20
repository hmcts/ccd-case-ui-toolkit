import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SessionStorageService } from '../../../../../services';
import { QueryListItem } from '../../models';
import { ActivatedRoute } from '@angular/router';
import {
  CaseView
} from '../../../../../../../lib/shared/domain';

@Component({
  selector: 'ccd-query-details',
  templateUrl: './query-details.component.html',
  styleUrls: ['./query-details.component.scss']
})
export class QueryDetailsComponent implements OnChanges{
  @Input() public query: QueryListItem;
  @Output() public backClicked: EventEmitter<boolean> = new EventEmitter();
  @Input() public caseId: string;

  public showLink: boolean = true;
  private static readonly QUERY_ITEM_RESPOND = '3';
  private queryItemId: string;

  constructor(
    private sessionStorageService: SessionStorageService,
    private readonly route: ActivatedRoute) { }

  public onBack(): void {
    this.backClicked.emit(true);
  }

  public isCaseworker(): boolean {
    const userDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    return userDetails && userDetails.roles
      && !(userDetails.roles.includes('pui-case-manager')
        || userDetails.roles.some((role) => role.toLowerCase().includes('judge')));
  }

  ngOnChanges(): void {
    this.toggleLinkVisibility();
  }

  public toggleLinkVisibility(): void {
    this.queryItemId = this.route.snapshot.params.qid;
    this.showLink = this.queryItemId !== QueryDetailsComponent.QUERY_ITEM_RESPOND;
  }
}
