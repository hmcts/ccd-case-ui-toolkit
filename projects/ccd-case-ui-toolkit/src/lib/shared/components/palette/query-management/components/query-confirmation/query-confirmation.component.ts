import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryCreateContext } from '../../models/query-create-context.enum';
import { SessionStorageService } from '../../../../../services';
import { isInternalUser, isJudiciaryUser } from '../../../../../utils';
import { CaseQueriesCollection, QueryListData } from '../../models';

@Component({
  selector: 'ccd-query-confirmation',
  templateUrl: './query-confirmation.component.html',
  standalone: false
})
export class QueryConfirmationComponent implements OnInit {
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public callbackConfirmationMessageText: { [key: string]: string } = {};
  @Input() public eventResponseData: CaseQueriesCollection;

  public caseId = '';
  public jurisdiction = '';
  public caseType = '';
  public queryCreateContextEnum = QueryCreateContext;
  public isHmctsStaffRaisedQuery: string;
  public isHmctsStaff: string;

  public queryListData: QueryListData | undefined;

  constructor(private readonly route: ActivatedRoute,
              private readonly sessionStorageService: SessionStorageService
  ) {
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    this.jurisdiction = this.route.snapshot.params.jurisdiction;
    this.caseType = this.route.snapshot.params.caseType;
    this.isHmctsStaff = (this.isJudiciaryUser() || this.isInternalUser()) ? 'Yes' : 'No';

    this.resolveHmctsStaffRaisedQuery();
  }

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public isJudiciaryUser(): boolean {
    return isJudiciaryUser(this.sessionStorageService);
  }

  public resolveHmctsStaffRaisedQuery(): void {
    const messageId = this.route.snapshot.params.dataid;
    if (!this.eventResponseData) {
      console.warn('No event response data available.');
      return;
    }

    this.queryListData = new QueryListData(this.eventResponseData);

    if (this.queryCreateContext === QueryCreateContext.FOLLOWUP) {
      const foundChild = this.queryListData?.queries
        ?.find((query) => query?.id === messageId);

      this.isHmctsStaffRaisedQuery = foundChild?.isHmctsStaff ?? null;
    }

    if (this.queryCreateContext === QueryCreateContext.RESPOND) {
      const child = this.queryListData?.queries
        ?.flatMap((p) => p.children || [])
        .find((c) => c.parentId === messageId);

      if (!child) {
        console.warn('No matching child found for messageId:', messageId);
        return;
      }

      const parentItem = this.queryListData?.queries
        ?.find((p) => p.id === child.parentId);

      this.isHmctsStaffRaisedQuery = parentItem?.isHmctsStaff ?? null;
    }
  }
}
