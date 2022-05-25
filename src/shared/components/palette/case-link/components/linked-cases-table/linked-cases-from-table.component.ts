import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { Subscription } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { GetLinkedCases } from '../../domain/linked-cases.model';
import { ActivatedRoute } from '@angular/router';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html'
})

export class LinkedCasesFromTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;
  @Input()
  public type: PageType = PageType.LINKEDCASESTABLBEVIEW;
  pageType = PageType;
  tableSubHeading = 'This case is linked from';

  public sub: Subscription;
  caseDetails: CaseView;
  parentUrl: string;
  isLoaded: boolean;
  getLinkedCasesResponse: GetLinkedCases;

  public caseId: string;

  constructor(
    private route: ActivatedRoute,
    private readonly casesService: CasesService) {
    }
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  ngOnInit(): void {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.casesService.getLinkedCases(this.caseId).subscribe(response => {
        this.getLinkedCasesResponse = response
      });
  }
}
