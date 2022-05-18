import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField, Jurisdiction } from '../../../../../domain/definition';
import { forkJoin, Subscription } from 'rxjs';
import { CaseView, HttpError } from '../../../../../domain';
import { ActivatedRoute } from '@angular/router';
import { SearchService } from '../../../../../services/search/search.service';
import { AbstractAppConfig } from '../../../../../../app.config';
import { DefinitionsService } from '../../../../../services/definitions';
import { READ_ACCESS } from '../../../../../domain/case-view/access-types.model';
import { CasesService } from '../../../../case-editor/services';
import { LinkCaseReason } from '../../domain/linked-cases.model';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

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
  @Input()
  public type: PageType = PageType.LINKEDCASESTABLBEVIEW;
  pageType = PageType;
  tableHeading= "Linked cases";
  tableSubHeading= "This case is linked to";
  caseNameHmctsInternal="Smith vs Peterson";
  
  public sub: Subscription;
  caseDetails: CaseView;
  parentUrl: string;
  isLoaded: boolean;
  linkedCasesFromResponse: any = []

  jurisdictions: Jurisdiction[];
  linkCaseReasons: LinkCaseReason[];

  constructor(
    private casesService: CasesService,
    private definitionsService: DefinitionsService,
    private appConfig: AbstractAppConfig,
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
    this.route.parent.url.subscribe(path => {
      this.parentUrl = `/${path.join('/')}`;
    });
    this.definitionsService.getJurisdictions(READ_ACCESS)
    .subscribe(jurisdictions => {
      this.casesService.getCaseLinkResponses().toPromise()
      .then(reasons => {
        this.linkCaseReasons = reasons;
      })
      .catch((error: HttpError) => {
        this.linkCaseReasons = [];
      });
      this.getAllCaseInformation(); // make sure we have a jurisdictions response before we map cases info
      this.jurisdictions = jurisdictions;
    });
  }

  groupByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x['caseReference']);
      return rv;
    }, {});
  };

  public getAllCaseInformation() {
    const searchCasesResponse = [];
    const caseTypeId = this.route.snapshot.data.case.case_type.id;
    const linkedCaseIds = this.groupByCaseType(this.caseField.value, 'caseType');
    Object.keys(linkedCaseIds).map(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const url = this.appConfig.getCaseDataUrl() + `/internal/searchCases?ctid=${caseTypeId}&use_case=${SearchService.VIEW_WORKBASKET}`
      const query = this.searchService.searchCasesByIds(key, esQuery, SearchService.VIEW_WORKBASKET);
      searchCasesResponse.push(query);
    })
    if (searchCasesResponse.length) 
    {
      this.sub = forkJoin(searchCasesResponse).subscribe((searchCases: any) => {
        searchCases.forEach(response => {
          response.results.forEach((result: any) => this.linkedCasesFromResponse.push(this.mapResponse(result,this.jurisdictions)));
          console.log(JSON.stringify(this.linkedCasesFromResponse));
        })
        this.isLoaded = true;
      });
    }
  }

  mapResponse(esSearchCasesResponse, jurisdictionsResponse) {
    const filteredCaseType = this.jurisdictions.filter(jurisdiction => {
      return jurisdiction.caseTypes.find(caseType => {
        if (caseType.id === esSearchCasesResponse.case_fields["[CASE_TYPE]"]) {
          return true;
        };
      });
    });
  const states = filteredCaseType[0].caseTypes[0].states
  const filteredstates = states.filter(obj => obj.id === esSearchCasesResponse.case_fields["[STATE]"])
  const linkedCaseReasons = this.caseField.value.find(item => item.caseReference === esSearchCasesResponse.case_id).reasons

    //const state = jurisdiction.map(caseType => caseType.)
    return {
      case_id: esSearchCasesResponse.case_id,
      caseName: '',
      caseType: esSearchCasesResponse.case_fields["[CASE_TYPE]"],
      service: esSearchCasesResponse.case_fields["[JURISDICTION]"],
      state: esSearchCasesResponse.case_fields["[STATE]"],
      reasons: linkedCaseReasons,
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
