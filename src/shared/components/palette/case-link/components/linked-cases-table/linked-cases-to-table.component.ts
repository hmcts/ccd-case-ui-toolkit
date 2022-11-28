import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink, LinkReason } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';

interface LinkedCasesResponse {
  caseReference: string
  caseName: string
  caseType: string;
  service: string;
  state: string;
  reasons: []
}

@Component({
  selector: 'ccd-linked-cases-to-table',
  templateUrl: './linked-cases-to-table.component.html',
  styleUrls: ['./linked-cases-to-table.component.scss']
})

export class LinkedCasesToTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);
  public caseConsolidatedReasonCode = 'CLRC015';
  public caseProgressedReasonCode = 'CLRC016';
  public caseNameMissingText = 'Case name missing';
  public caseDetails: CaseView;
  public isLoaded: boolean;
  public linkedCasesFromResponse: LinkedCasesResponse[] = [];
  public caseId: string;
  public isServerError = false;
  public jurisdictionsResponse: Jurisdiction[] = [];

  constructor(
    private route: ActivatedRoute,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly casesService: CasesService) { }

  public ngAfterViewInit(): void {
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot && this.route.snapshot.data && this.route.snapshot.data.case.case_id;
    this.getAllLinkedCaseInformation()
    if (this.route.snapshot.data.case) {
      this.linkedCasesService.caseDetails = this.route.snapshot.data.case;
    }
  }

  public getCaseRefereneLink(caseRef) {
    return caseRef.slice(this.caseId.length - 4);
  }

  public sortLinkedCasesByReasonCode(searchCasesResponse) {
    const topLevelresultArray = [];
    let secondLevelresultArray = [];
    searchCasesResponse.forEach((item: any) => {
      const reasons = item && item.reasons || [];
      const consolidatedStateReason = reasons.map(x => x).find(reason => reason === this.caseConsolidatedReasonCode);
      const progressedStateReason = reasons.map(x => x).find(reason => reason === this.caseProgressedReasonCode);
      let arrayItem;
      if (progressedStateReason) {
        arrayItem = { ...item };
        topLevelresultArray.push(arrayItem);
      } else if (consolidatedStateReason) {
        arrayItem = { ...item };
        secondLevelresultArray = [{ ...item }, ...secondLevelresultArray]
      } else {
        arrayItem = { ...item };
        secondLevelresultArray.push({ ...item });
      }
    })
    return topLevelresultArray.concat(secondLevelresultArray)
  }

  public getAllLinkedCaseInformation() {
    const searchCasesResponse = [];
    const caseFieldValue = this.caseField ? this.caseField.value : [];
    // Generate the list of observables
    caseFieldValue.forEach(fieldValue => {
      if (fieldValue && fieldValue.id) {
        searchCasesResponse.push(this.casesService.getCaseViewV2(fieldValue.id));
      }
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
        const casesResponse = [];
        searchCases.forEach(response => {
          casesResponse.push(this.mapResponse(response))
        });
        this.linkedCasesFromResponse = this.sortLinkedCasesByReasonCode(casesResponse);
        this.isLoaded = true;
        const caseLinks = this.linkedCasesFromResponse.map(item => {
          return {
            caseReference: item.caseReference,
            caseName: item.caseName,
            caseService: item.service,
            caseType: item.caseType,
            unlink: false,
            reasons: item.reasons && item.reasons.map(reason => {
              return {
                reasonCode: reason
              } as LinkReason
            }),
          } as CaseLink
        });
        this.linkedCasesService.initialCaseLinks = caseLinks;
        this.linkedCasesService.linkedCases = caseLinks;
        this.isServerError = false;
      },
        err => {
          this.isServerError = true;
          this.notifyAPIFailure.emit(true)
        }
      );
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }

  public hasLeadCaseOrConsolidated(reasonCode: string) {
    return reasonCode === this.caseProgressedReasonCode || reasonCode === this.caseConsolidatedReasonCode;
  }

  public mapResponse(esSearchCasesResponse) {
    const caseInfo = this.caseField.value.find(item => item.value && item.value.CaseReference === esSearchCasesResponse.case_id);
    return caseInfo && {
      caseReference: esSearchCasesResponse.case_id,
      caseName: esSearchCasesResponse.caseNameHmctsInternal || this.caseNameMissingText,
      caseType: esSearchCasesResponse.case_type.description || '',
      service: esSearchCasesResponse.case_type && esSearchCasesResponse.case_type.jurisdiction.description || '',
      state: esSearchCasesResponse.state.description || '',
      reasons: caseInfo.value && caseInfo.value.ReasonForLink &&
        caseInfo.value.ReasonForLink.map(reason => reason.value && reason.value.Reason),
    } as LinkedCasesResponse
  }
}
