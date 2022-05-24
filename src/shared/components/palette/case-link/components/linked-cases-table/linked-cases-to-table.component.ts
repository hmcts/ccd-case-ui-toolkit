import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { forkJoin, Subscription } from 'rxjs';
import { CaseView } from '../../../../../domain';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../../../services/search/search.service';
import { LinkCaseReason } from '../../domain/linked-cases.model';
import { CasesService } from '../../../../case-editor';

interface LinkedCasesResponse {
  caseReference: string
  caseName: string
  caseType: string;
  service: string;
  state: string;
  Reasons: []
}

@Component({
  selector: 'ccd-linked-cases-to-table',
  templateUrl: './linked-cases-to-table.component.html'
})

export class LinkedCasesToTableComponent extends AbstractFieldReadComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;

  tableHeading= "Linked cases";
  tableSubHeading= "This case is linked to";
  caseNameHmctsInternal="Smith vs Peterson";
  
  public sub: Subscription;
  caseDetails: CaseView;
  isLoaded: boolean;
  linkedCasesFromResponse: any = []

  jurisdictions: Jurisdiction[];
  linkedCaseReasons: LinkCaseReason[];
  public caseId: string;

  constructor(
    private casesService: CasesService,
    private route: ActivatedRoute,
    private readonly searchService: SearchService) {
      super();
    }
  
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if(labelField && labelField.length) {
      labelField[0].replaceWith('')
    }
  }

  ngOnInit(): void {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.casesService.getCaseLinkResponses().subscribe(reasons => {
      this.linkedCaseReasons = reasons;
    })
    this.getAllLinkedCaseInformation();
  }

  groupByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) =>   {
      (rv[x[key]] = rv[x[key]] || []).push(x['caseReference']);
      return rv;
    }, {});
  };

  public getCaseRefereneLink(caseRef) {
    return caseRef.slice(this.caseId.length - 4);
  }

  sortByReasonCode() {
    const topLevelresultArray = [];
    let secondLevelresultArray = [];
    const data = this.caseField.value as []
    data && data.forEach((item: any) => {
      const progressedStateReason = item.reasons.find(reason => reason.reasonCode === 'Progressed')
      const consolidatedStateReason = item.reasons.find(reason => reason.reasonCode === 'Case consolidated')
      if (progressedStateReason) {
        topLevelresultArray.push(item)
      } else if (consolidatedStateReason) {
        secondLevelresultArray = [item, ...secondLevelresultArray ]
      } else {
        secondLevelresultArray.push(item)
      }
    })
    return topLevelresultArray.concat(secondLevelresultArray)
  }

  public getAllLinkedCaseInformation() {
    const searchCasesResponse = [];
    const sortedCases = this.sortByReasonCode()
    const linkedCaseIds = this.groupByCaseType(sortedCases, 'caseType');
    Object.keys(linkedCaseIds).map(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const query = this.searchService.searchCasesByIds(key, esQuery, SearchService.VIEW_WORKBASKET);
      searchCasesResponse.push(query);
    })
    if (searchCasesResponse.length)
    {
      this.searchCasesByCaseIds(searchCasesResponse).subscribe((searchCases: any) => {
        searchCases && searchCases.forEach(response => {
          response.results.forEach((result: any) => this.linkedCasesFromResponse.push(this.mapResponse(result)));
        });
        this.isLoaded = true;
      });;
    }
  }

  public searchCasesByCaseIds(searchCasesResponse: any[]) {
    return forkJoin(searchCasesResponse);
  }

  hasLeadCaseOrConsolidated(reasonCode: string) {
    return reasonCode === 'Progressed as part of this lead case' || reasonCode === 'Case consolidated'
  }

  mapResponse(esSearchCasesResponse) {
    const reasonDescriptons = []
    const caseReasonCode = this.caseField.value.find(item => item.caseReference === esSearchCasesResponse.case_id);
    caseReasonCode && caseReasonCode.reasons.forEach(code => {
      const foundReasonMapping = this.linkedCaseReasons.find(reason => reason.key === code.reasonCode);
      if (foundReasonMapping) {
        reasonDescriptons.push(foundReasonMapping.value_en)
      }
    })
    return {
      case_id: esSearchCasesResponse.case_id,
      caseName: '',
      caseType: esSearchCasesResponse.case_fields["[CASE_TYPE]"],
      service: esSearchCasesResponse.case_fields["[JURISDICTION]"],
      state: esSearchCasesResponse.case_fields["[STATE]"],
      reasons: reasonDescriptons,
    } as unknown as LinkedCasesResponse
  }

  constructElasticSearchQuery(caseIds: any[], size: number) {
    return {
        query: {
          terms: {
            reference: caseIds,
          },
        },
        size,
    };
  }
}
