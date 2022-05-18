import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField } from '../../../../../domain/definition';
import { OrganisationVm } from '../../../../../services/organisation';
import { Observable, Subscription } from 'rxjs';
import { SimpleOrganisationModel } from '../../../../../domain/organisation';
import { CaseView } from '../../../../../domain';

export enum PageType {
  LINKEDCASESTOTABLBEVIEW = 'linkedCasesToTableView',
  LINKEDCASESFROMTABLBEVIEW = 'linkedCasesFromTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-table',
  templateUrl: './linked-cases-table.component.html'
})

export class LinkedCasesTableComponent implements AfterViewInit {

  @Input()
  caseField: CaseField;
  @Input()
  linkedCasesResponse: [];
  @Input() tableHeading: string = ""
  @Input() tableSubHeading: string = "";
  
  public sub: Subscription;
  caseDetails: CaseView;
  parentUrl: string;
  isLoaded: boolean;
  linkedCasesFromResponse: any = []

  public organisations$: Observable<OrganisationVm[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if(labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }
}

