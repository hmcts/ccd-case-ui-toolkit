import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { CaseView } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesResponse } from '../../domain/linked-cases.model';
import { ActivatedRoute } from '@angular/router';
import { LovRefDataModel } from '../../../../../services/common-data-service/common-data-service';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html',
  styleUrls: ['./linked-cases-from-table.component.scss']
})

export class LinkedCasesFromTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);

  pageType = PageType;
  public tableSubHeading = 'This case is linked from';

  public caseDetails: CaseView;
  public parentUrl: string;
  public isLoaded: boolean;
  public getLinkedCasesResponse: LinkedCasesResponse;
  public linkedCaseReasons: LovRefDataModel[];

  public caseId: string;
  public showHideLinkText = 'Show';
  public noLinkedCases = true;

  constructor(
    private route: ActivatedRoute,
    private readonly casesService: CasesService,
    ) {
  }

  public ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  public ngOnInit(): void {
    this.fetchPageData();
  }

  public fetchPageData() {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.getLinkedCases().subscribe(
      response => {
        this.getLinkedCasesResponse = response;
        this.noLinkedCases = !this.getLinkedCasesResponse.linkedCases || !this.getLinkedCasesResponse.linkedCases.length;
      },
      () => this.notifyAPIFailure.emit(true)
      );
  }

  public getLinkedCases() {
    return this.casesService.getLinkedCases(this.caseId);
  }

  public onClick(): void {
    this.showHideLinkText = this.showHideLinkText === 'Show'
      ? 'Hide'
      : 'Show';
  }
}
