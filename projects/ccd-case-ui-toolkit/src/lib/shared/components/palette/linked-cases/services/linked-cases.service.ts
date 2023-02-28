import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { CaseView } from '../../../../domain/case-view';
import { Jurisdiction } from '../../../../domain/definition/jurisdiction.model';
import { JurisdictionService, SearchService } from '../../../../services';
import { LovRefDataModel } from '../../../../services/common-data-service/common-data-service';
import { CaseLink, ESQueryType, LinkReason } from '../domain';

@Injectable()
export class LinkedCasesService {

  private static readonly CASE_NAME_MISSING_TEXT = 'Case name missing';

  public caseFieldValue = [];
  public isLinkedCasesEventTrigger = false;
  public caseDetails: CaseView;
  public caseId: string;
  public caseName: string;
  public linkCaseReasons: LovRefDataModel[] = [];
  public linkedCases: CaseLink[] = [];
  public initialCaseLinks: CaseLink[] = [];
  public editMode = false;
  public jurisdictionsResponse: Jurisdiction[] = [];
  public serverJurisdictionError: boolean;
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

  public mapResponse(esSearchCasesResponse): any {
    const caseInfo = this.caseFieldValue.find(item => item.value && item.value.CaseReference === esSearchCasesResponse.case_id);
    return caseInfo && {
      caseReference: esSearchCasesResponse.case_id,
      caseName: esSearchCasesResponse.case_fields.caseNameHmctsInternal || LinkedCasesService.CASE_NAME_MISSING_TEXT,
      caseType: this.mapLookupIDToValueFromJurisdictions('CASE_TYPE', esSearchCasesResponse.case_fields['[CASE_TYPE]']),
      service: this.mapLookupIDToValueFromJurisdictions('JURISDICTION', esSearchCasesResponse.case_fields['[JURISDICTION]']),
      state: this.mapLookupIDToValueFromJurisdictions('STATE', esSearchCasesResponse.case_fields['[STATE]']),
      reasons: caseInfo?.value?.ReasonForLink
    };
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]): Observable<unknown[]> {
    return forkJoin(searchCasesResponse);
  }

  public getAllLinkedCaseInformation(): void {
    const searchCasesResponse = [];
    const linkedCaseIds = this.groupLinkedCasesByCaseType(this.caseFieldValue, 'CaseType');
    Object.keys(linkedCaseIds).forEach(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100);
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
                Reason: reason
              } as LinkReason;
            }),
          } as CaseLink;
        });
        this.linkedCases = caseLinks;
        this.serverLinkedApiError = null;
      },
      err => {
        this.serverLinkedApiError = {
          id: 'backendError', message: 'Some case information is not available at the moment'
        };
      });
    }
  }

  public mapLookupIDToValueFromJurisdictions(fieldName, fieldValue): string {
    const selectedJurisdiction = this.jurisdictionsResponse &&
      this.jurisdictionsResponse.find(item => item.id === this.caseDetails.case_type.jurisdiction.id);
    const selectedCaseType = selectedJurisdiction && selectedJurisdiction.caseTypes.find(item => item.id === this.caseDetails.case_type.id);
    const state = selectedCaseType && selectedCaseType.states.find(item => item.id === fieldValue);
    switch (fieldName) {
      case 'JURISDICTION':
        return selectedJurisdiction && selectedJurisdiction.description;
      case 'CASE_TYPE':
        return selectedCaseType && selectedCaseType.name;
      case 'CASE_TYPE_DESCRIPTION':
        return selectedCaseType && selectedCaseType.description;
      case 'STATE':
        return state && state.name || fieldValue;
      case 'STATE_DESCRIPTION':
        return state && state.description || fieldValue;
      default:
        break;
    }
  }

  public getCaseName(searchCasesResponse: CaseView): string {
    let caseName = LinkedCasesService.CASE_NAME_MISSING_TEXT;
    const tabs = searchCasesResponse.tabs.filter(tab => {
      const caseNameHmctsInternalField = tab.fields.find(field => field.id === 'caseNameHmctsInternal');
      if (caseNameHmctsInternalField) {
        caseName = caseNameHmctsInternalField.value;
      }
    });
    return caseName;
  }
}
