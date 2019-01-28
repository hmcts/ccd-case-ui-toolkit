import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseHistory } from '../domain';
import { CaseTab, CaseView } from '../../../domain';
import { OrderService } from '../../../services';
import { ShowCondition } from '../../../directives';
import { CaseService } from '../../case-editor';

@Component({
  templateUrl: './case-history.component.html',
  styleUrls: ['./case-history.component.scss']
})
export class CaseHistoryComponent implements OnInit {

  caseHistory: CaseHistory;
  caseDetails: CaseView;
  tabs: CaseTab[];

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private caseService: CaseService) { }

  ngOnInit() {
    this.caseHistory = this.route.snapshot.data.caseHistory;
    if (!this.route.snapshot.data.case) {
      this.caseService.caseViewSource.asObservable().subscribe(caseDetails => {
        this.caseDetails = caseDetails;
      });
    } else {
      this.caseDetails = this.route.snapshot.data.case;
    }
    this.tabs = this.orderService.sort(this.caseHistory.tabs);
    this.tabs = this.sortTabFieldsAndFilterTabs(this.tabs);
  }

  isDataLoaded() {
    return this.caseDetails && this.caseHistory ? true : false;
  }

  private sortTabFieldsAndFilterTabs(tabs: CaseTab[]): CaseTab[] {
    return tabs
      .map(tab => Object.assign({}, tab, { fields: this.orderService.sort(tab.fields) }))
      .filter(tab => new ShowCondition(tab.show_condition).matchByCaseFields(tab.fields));
  }
}
