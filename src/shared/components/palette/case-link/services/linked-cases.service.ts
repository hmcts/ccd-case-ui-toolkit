import { Injectable } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CaseView } from '../../../../domain/case-view';
import { Jurisdiction } from '../../../../domain/definition/jurisdiction.model';
import { SearchService } from '../../../../services';
import { LovRefDataModel } from '../../../../services/common-data-service/common-data-service';
import { CaseLink, ESQueryType, LinkReason } from '../domain';
import { JurisdictionService } from './jurisdiction.service';

@Injectable()
export class LinkedCasesService {
  public caseFieldValue = [];
  public isLinkedCasesEventTrigger = false;
  public caseDetails: CaseView;
  public caseId: string;
  public linkCaseReasons: LovRefDataModel[] = [];
  public linkedCases: CaseLink[] = [];
  public initialCaseLinks: CaseLink[] = [];
  public editMode = false;
  public jurisdictionsResponse: Jurisdiction[] = [];
  public serverJurisdictionError: boolean;
  public caseNameMissingText = 'Case name missing';
  public serverError: { id: string, message: string } = null;
  public serverLinkedApiError: { id: string, message: string } = null;
  public isServerReasonCodeError = false;
  public caseJurisdictionID = null;

  constructor(private readonly jurisdictionService: JurisdictionService,
              private readonly searchService: SearchService) {
    this.jurisdictionService.getJurisdictions().subscribe((jurisdictions) => {
      this.jurisdictionsResponse = jurisdictions;
    }, (error) => {
      this.serverJurisdictionError = true;
    });
  }

  public groupLinkedCasesByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) => {
      (rv[x.value[key]] = rv[x.value[key]] || []).push(x.value['CaseReference']);
      return rv;
    }, {});
  };

  public constructElasticSearchQuery(caseIds: any[], size: number): ESQueryType {
    return {
      query: {
        terms: {
          reference: caseIds,
        },
      },
      size,
    };
  }

  public mapResponse(esSearchCasesResponse) {
    const caseInfo = this.caseFieldValue.find(item => item.value && item.value.CaseReference === esSearchCasesResponse.case_id);
    return caseInfo && {
      caseReference: esSearchCasesResponse.case_id,
      caseName: esSearchCasesResponse.case_fields.caseNameHmctsInternal || this.caseNameMissingText,
      caseType: this.mapLookupIDToValueFromJurisdictions('CASE_TYPE', esSearchCasesResponse.case_fields['[CASE_TYPE]']),
      service: this.mapLookupIDToValueFromJurisdictions('JURISDICTION', esSearchCasesResponse.case_fields['[JURISDICTION]']),
      state: this.mapLookupIDToValueFromJurisdictions('STATE', esSearchCasesResponse.case_fields['[STATE]']),
      reasons: caseInfo.value && caseInfo.value.ReasonForLink &&
        caseInfo.value.ReasonForLink.map(reason => reason.value && reason.value.Reason),
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }

  public getAllLinkedCaseInformation() {
    const searchCasesResponse = [];
    const linkedCaseIds = this.groupLinkedCasesByCaseType(this.caseFieldValue, 'CaseType');
    Object.keys(linkedCaseIds).forEach(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const query = this.searchService.searchCasesByIds(key, esQuery, SearchService.VIEW_WORKBASKET);
      searchCasesResponse.push(query);
    });
    if (searchCasesResponse.length) {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
        const casesResponse = [];
        searchCases.forEach(response => {
          response.results.forEach((result: any) => {
            casesResponse.push(this.mapResponse(result));
          });
        });

        const caseLinks = casesResponse.map(item => {
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
        this.linkedCases = caseLinks;
        this.serverLinkedApiError = null;
      },
      err => {
        this.serverLinkedApiError = {
          id: 'backendError', message: 'Some case information is not available at the moment'
        }
      }
    )
    }
  }

  public mapLookupIDToValueFromJurisdictions(fieldName, fieldValue): string {
    const selectedJurisdiction = this.jurisdictionsResponse &&
      this.jurisdictionsResponse.find(item => item.id === this.caseDetails.case_type.jurisdiction.id);
    const selectedCaseType = selectedJurisdiction && selectedJurisdiction.caseTypes.find(item => item.id === this.caseDetails.case_type.id);
    switch (fieldName) {
      case 'JURISDICTION':
        return selectedJurisdiction && selectedJurisdiction.description;
      case 'CASE_TYPE':
        return selectedCaseType && selectedCaseType.description;
      case 'STATE':
        const state = selectedCaseType && selectedCaseType.states.find(item => item.id === fieldValue);
        return state && state.description || fieldValue;
      default:
        break;
    }
  }
}
