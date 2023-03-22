import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { CaseField } from '../../../../../domain/definition';
import { LovRefDataModel } from '../../../../../services/common-data-service/common-data-service';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLinkResponse, LinkedCasesResponse } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html',
  styleUrls: ['./linked-cases-from-table.component.scss']
})

export class LinkedCasesFromTableComponent implements OnInit, AfterViewInit {

  private static readonly CASE_NAME_MISSING_TEXT = 'Case name missing';

  @Input()
  public caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);
  public caseDetails: CaseView;
  public parentUrl: string;
  public isLoaded: boolean;
  public getLinkedCasesResponse: CaseLinkResponse[];
  public linkedCaseReasons: LovRefDataModel[];

  public caseId: string;
  public showHideLinkText = 'Show';
  public noLinkedCases = true;
  public isServerError = false;
  public isServerReasonCodeError = false;

  constructor(
    private readonly route: ActivatedRoute,
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
    this.isServerReasonCodeError = this.linkedCasesService.isServerReasonCodeError;
  }

  public fetchPageData() {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.getLinkedCases().subscribe({
      next: response => {
        this.isServerError = false;
        this.getLinkedCasesResponse = response.linkedCases && response.linkedCases.map(item => {
          const mappedCasetype = this.mapLookupIDToValueFromJurisdictions('CASE_TYPE', item.ccdCaseType);
          const mappedCasetypeDescription = this.mapLookupIDToValueFromJurisdictions('CASE_TYPE_DESCRIPTION', item.ccdCaseType);
          const mappedCaseState = this.mapLookupIDToValueFromJurisdictions('STATE', item.state);
          const mappedCaseStateDescription = this.mapLookupIDToValueFromJurisdictions('STATE_DESCRIPTION', item.state);
          const mappedCaseService = this.mapLookupIDToValueFromJurisdictions('JURISDICTION', item.ccdJurisdiction);
          return {
            ...item,
            ccdCaseType: mappedCasetype,
            ccdCaseTypeDescription: mappedCasetypeDescription,
            ccdJurisdiction: mappedCaseService,
            state: mappedCaseState,
            stateDescription: mappedCaseStateDescription,
            caseNameHmctsInternal: item.caseNameHmctsInternal || LinkedCasesFromTableComponent.CASE_NAME_MISSING_TEXT,
            linkDetails: item.linkDetails
          } as CaseLinkResponse;
        });
        this.noLinkedCases = !response.linkedCases || !response.linkedCases.length;
      },
      error: () => {
        this.isServerError = true;
        this.notifyAPIFailure.emit(true);
      }
    });
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
