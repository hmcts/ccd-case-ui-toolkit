import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QueryCreateContext } from '../../models/query-create-context.enum';
import { SessionStorageService } from '../../../../../services';
import { isInternalUser, isJudiciaryUser } from '../../../../../utils';
import { CaseQueriesCollection } from '../../models';

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
  public isHmctsStaff: string;

  constructor(private readonly route: ActivatedRoute,
              private readonly sessionStorageService: SessionStorageService
  ) {
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot.params.cid;
    this.jurisdiction = this.route.snapshot.params.jurisdiction;
    this.caseType = this.route.snapshot.params.caseType;
    this.isHmctsStaff = (this.isJudiciaryUser() || this.isInternalUser()) ? 'Yes' : 'No';
  }

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public isJudiciaryUser(): boolean {
    return isJudiciaryUser(this.sessionStorageService);
  }
}
