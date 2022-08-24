import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { CaseView } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLinkResponse, LinkedCasesResponse } from '../../domain/linked-cases.model';
import { ActivatedRoute } from '@angular/router';
import { LovRefDataModel } from '../../../../../services/common-data-service/common-data-service';
import { Observable } from 'rxjs';
import { LinkedCasesService } from '../../services';

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
  public pageType = PageType;
  public caseDetails: CaseView;
  public parentUrl: string;
  public isLoaded: boolean;
  public getLinkedCasesResponse: CaseLinkResponse[] = [];
  public linkedCaseReasons: LovRefDataModel[];

  public caseId: string;
  public showHideLinkText = 'Show';
  public noLinkedCases = true;
  public isServerError = false;


  constructor(
    private route: ActivatedRoute,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService,
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
    if (this.route.snapshot.data.case) {
      this.linkedCasesService.caseDetails = this.route.snapshot.data.case;
    }
  }

  public fetchPageData() {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.getLinkedCases().subscribe(
      response => {
        this.isServerError = false;
        this.getLinkedCasesResponse = response.linkedCases && response.linkedCases.map(item => {
          const mappedCasetype = this.mapLookupIDToValueFromJurisdictions('CASE_TYPE', item.ccdCaseType);
          const mappedCaseState = this.mapLookupIDToValueFromJurisdictions('STATE', item.state);
          const mappedCaseService = this.mapLookupIDToValueFromJurisdictions('JURISDICTION', item.ccdJurisdiction);
          return {...item, ccdCaseType: mappedCasetype, ccdJurisdiction: mappedCaseService,
            state: mappedCaseState, caseNameHmctsInternal: item.caseNameHmctsInternal ||  'Case name missing'}
        })
        this.noLinkedCases = !response.linkedCases || !response.linkedCases.length;
      },
      err => {
        this.isServerError = true;
        this.notifyAPIFailure.emit(true);
      }
      );
  }

  public getLinkedCases(): Observable<LinkedCasesResponse> {
    return this.casesService.getLinkedCases(this.caseId);
  }

  public mapLookupIDToValueFromJurisdictions(fieldName, fieldValue): string {
    return this.linkedCasesService.mapLookupIDToValueFromJurisdictions(fieldName, fieldValue);
  }

  public onClick(): void {
    this.showHideLinkText = this.showHideLinkText === 'Show'
      ? 'Hide'
      : 'Show';
  }
}
