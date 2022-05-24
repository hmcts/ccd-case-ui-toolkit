import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { Subscription, throwError } from 'rxjs';
import { CaseView, HttpError } from '../../../../../domain';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { CasesService } from '../../../../case-editor';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html'
})

export class LinkedCasesFromTableComponent extends AbstractFieldReadComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;
  @Input()
  public type: PageType = PageType.LINKEDCASESTABLBEVIEW;
  pageType = PageType;
  tableSubHeading= "This case is linked from";

  public sub: Subscription;
  caseDetails: CaseView;
  parentUrl: string;
  isLoaded: boolean;
  getLinkedCasesResponse: any;

  jurisdictions: Jurisdiction[];

  constructor(
    private readonly casesService: CasesService    ) {
      super();
    }
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if(labelField && labelField.length) {
      labelField[0].replaceWith('')
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
