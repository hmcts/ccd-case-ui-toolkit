import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { SessionStorageService } from '../../../../../services';
import { QueryListItem } from '../../models';
import { ActivatedRoute } from '@angular/router';
import { CaseNotifier, WorkAllocationService } from '../../../../case-editor/services';
import { take } from 'rxjs';
import {
  CaseView,
  CaseViewTrigger
} from '../../../../../../../lib/shared/domain';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';

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

  private caseViewTrigger: CaseViewTrigger;
  public caseDetails: CaseView;
  private queryId: string;
  private tid: string;
  private readonly RAISE_A_QUERY_EVENT_TRIGGER_ID = 'queryManagementRaiseQuery';
  private readonly RESPOND_TO_QUERY_EVENT_TRIGGER_ID = 'queryManagementRespondQuery';

  public eventCompletionParams: EventCompletionParams;
  constructor(
    private sessionStorageService: SessionStorageService,
    private readonly route: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier,
    private readonly workAllocationService: WorkAllocationService,) { }

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

    console.log('this page');

    this.queryId = this.route.snapshot.params.qid;
    this.tid = this.route.snapshot.queryParams.tid; // Query parameter tid
    this.caseNotifier.caseView.pipe(take(1)).subscribe((caseDetails) => {
      this.caseDetails = caseDetails;
    });

    this.workAllocationService.getTasksByCaseIdAndEventId('queryManagementRespondToQuery', '1737119867172641', this.caseDetails.case_type.id, this.caseDetails.case_type.jurisdiction.id)
      .subscribe(
        (response: any) => {
          console.log('response:-queryManagementRespondToQ', response);
        }
      );

    this.workAllocationService.getTask('95041595-d4d5-11ef-896e-82ef3d5e280d').subscribe(
      (response: any) => {
        console.log('response------:', response);
      },
      (error) => {
        console.error('Error in searchTasksSubscription:', error);
        // Handle error appropriately
      }
    );

    const searchParameter = { ccdId: '1737119867172641' };
    this.workAllocationService.searchTasks(searchParameter)
      .subscribe(
        (response: any) => {
          console.log('response:searchTasks', response);
        },
      );
  }

  public toggleLinkVisibility(): void {
    this.queryItemId = this.route.snapshot.params.qid;
    this.showLink = this.queryItemId !== QueryDetailsComponent.QUERY_ITEM_RESPOND;
  }
}
