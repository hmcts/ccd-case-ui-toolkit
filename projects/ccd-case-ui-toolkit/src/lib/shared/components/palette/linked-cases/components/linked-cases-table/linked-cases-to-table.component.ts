import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { CaseLink, LinkReason } from '../../domain/linked-cases.model';
import { LinkedCasesService } from '../../services';

interface LinkedCasesResponse {
  caseReference: string;
  caseName: string;
  caseType: string;
  caseTypeDescription: string;
  service: string;
  state: string;
  stateDescription: string;
  reasons: string[];
}

@Component({
  selector: 'ccd-linked-cases-to-table',
  templateUrl: './linked-cases-to-table.component.html',
  styleUrls: ['./linked-cases-to-table.component.scss']
})
export class LinkedCasesToTableComponent implements OnInit, AfterViewInit {

  private static readonly CASE_CONSOLIDATED_REASON_CODE = 'CLRC015';
  private static readonly CASE_PROGRESS_REASON_CODE = 'CLRC016';

  @Input()
  public caseField: CaseField;

  @Output()
  public notifyAPIFailure: EventEmitter<boolean> = new EventEmitter(false);
  public caseDetails: CaseView;
  public isLoaded: boolean;
  public linkedCasesFromResponse: LinkedCasesResponse[] = [];
  public caseId: string;
  public isServerError = false;
  public isServerReasonCodeError = false;
  public jurisdictionsResponse: Jurisdiction[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly casesService: CasesService) { }

  public ngAfterViewInit(): void {
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  public ngOnInit(): void {
    this.caseId = this.route.snapshot && this.route.snapshot.data && this.route.snapshot.data.case.case_id;
    this.getAllLinkedCaseInformation();
    if (this.route.snapshot.data.case) {
      this.linkedCasesService.caseDetails = this.route.snapshot.data.case;
    }
    this.isServerReasonCodeError = this.linkedCasesService.isServerReasonCodeError;
  }

  public getCaseRefereneLink(caseRef: string): string {
    return caseRef.slice(this.caseId.length - 4);
  }

  public sortLinkedCasesByReasonCode(searchCasesResponse): LinkedCasesResponse[] {
    const topLevelresultArray = [];
    let secondLevelresultArray = [];
    searchCasesResponse.forEach((item: any) => {
      const reasons = item && item.reasons || [];
      const consolidatedStateReason = reasons.map(x => x).find(
        reason => reason === LinkedCasesToTableComponent.CASE_CONSOLIDATED_REASON_CODE
      );
      const progressedStateReason = reasons.map(x => x).find(
        reason => reason === LinkedCasesToTableComponent.CASE_PROGRESS_REASON_CODE
      );
      const arrayItem = { ...item };
      if (progressedStateReason) {
        topLevelresultArray.push(arrayItem);
      } else if (consolidatedStateReason) {
        secondLevelresultArray = [{ ...item }, ...secondLevelresultArray];
      } else {
        secondLevelresultArray.push({ ...item });
      }
    });
    return topLevelresultArray.concat(secondLevelresultArray);
  }

  public getAllLinkedCaseInformation(): void {
    const searchCasesResponse = [];
    const caseFieldValue = this.caseField && this.caseField.id === 'caseLinks' ? this.caseField.value : [];
    // Generate the list of observables
    caseFieldValue.forEach(fieldValue => {
      if (fieldValue && fieldValue.id) {
        searchCasesResponse.push(this.casesService.getCaseViewV2(fieldValue.id));
      }
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
        let casesResponse = [];
        searchCases.forEach(response => {
          casesResponse.push(this.mapResponse(response));
        });
        casesResponse = this.sortReasonCodes(casesResponse);
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
                Reason: reason
              } as LinkReason;
            }),
          } as CaseLink;
        });
        this.linkedCasesService.initialCaseLinks = caseLinks;
        this.linkedCasesService.linkedCases = caseLinks;
        this.isServerError = false;
      },
      err => {
          this.isServerError = true;
          this.notifyAPIFailure.emit(true);
        }
      );
    }
  }

  public sortReasonCodes(searchCasesResponse): LinkedCasesResponse[] {
    searchCasesResponse.forEach((item: any) => {
      if (item?.reasons?.length) {
        item.reasons.forEach((reason) => {
          reason.sortOrder = this.getReasonSortOrder(reason.value.Reason)
        });
        item.reasons = item.reasons.sort((a, b) => a.sortOrder - b.sortOrder);
        item.sortOrder = item.reasons[0].sortOrder;
      }
    });
    searchCasesResponse = searchCasesResponse?.sort((a, b) => a.sortOrder - b.sortOrder)
    return searchCasesResponse;
  }

  public getReasonSortOrder(reasonCode: string): number {
    if (reasonCode === LinkedCasesToTableComponent.CASE_PROGRESS_REASON_CODE) {
      return 1;
    } else if (reasonCode === LinkedCasesToTableComponent.CASE_CONSOLIDATED_REASON_CODE) {
      return 2;
    }
    return 3;
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]): Observable<unknown[]> {
    return forkJoin(searchCasesResponse);
  }

  public hasLeadCaseOrConsolidated(reasonCode: string): boolean {
    return reasonCode === LinkedCasesToTableComponent.CASE_PROGRESS_REASON_CODE ||
      reasonCode === LinkedCasesToTableComponent.CASE_CONSOLIDATED_REASON_CODE;
  }

  public mapResponse(esSearchCasesResponse): LinkedCasesResponse {
    const caseInfo = this.caseField.value.find(item => item.value && item.value.CaseReference === esSearchCasesResponse.case_id);
    return caseInfo && {
      caseReference: esSearchCasesResponse.case_id,
      caseName: this.linkedCasesService.getCaseName(esSearchCasesResponse),
      caseType: esSearchCasesResponse.case_type.name || '',
      caseTypeDescription: esSearchCasesResponse.case_type.description || '',
      service: esSearchCasesResponse.case_type && esSearchCasesResponse.case_type.jurisdiction.description || '',
      state: esSearchCasesResponse.state.name || '',
      stateDescription: esSearchCasesResponse.state.description || '',
      reasons: caseInfo?.value?.ReasonForLink
    } as LinkedCasesResponse;
  }
}
