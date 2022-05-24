import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { Subscription, throwError } from 'rxjs';
import { CaseView, HttpError } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';

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
  getLinkedCasesResponse: any;

  jurisdictions: Jurisdiction[];

  constructor(
    private readonly casesService: CasesService) {
    }
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  ngOnInit(): void {
    this.casesService.getLinkedCases('').toPromise()
      .then(response => this.getLinkedCasesResponse = response)
      .catch((error: HttpError) => {
        return throwError(error);
      });
  }
}
