import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { Subscription, throwError } from 'rxjs';
import { CaseView, HttpError } from '../../../../../domain';
import { ActivatedRoute } from '@angular/router';
import { AbstractAppConfig } from '../../../../../../app.config';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { DefinitionsService } from '../../../../../services/definitions';
import { READ_ACCESS } from '../../../../../domain/case-view/access-types.model';

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
    private definitionsService: DefinitionsService,
    private appConfig: AbstractAppConfig,
    private route: ActivatedRoute,
    private readonly linkedCasesService: LinkedCasesService    ) {
      super();
    }
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if(labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  ngOnInit(): void {
    this.linkedCasesService.getLinkedCases('').toPromise()
      .then(response => this.getLinkedCasesResponse = response)
      .catch((error: HttpError) => {
        return throwError(error);
      });

    this.definitionsService.getJurisdictions(READ_ACCESS)
    .subscribe(jurisdictions => {
      this.jurisdictions = jurisdictions;
    });
  }

}
