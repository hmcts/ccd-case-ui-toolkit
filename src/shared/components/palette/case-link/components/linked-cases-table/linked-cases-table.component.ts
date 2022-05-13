import { AfterViewInit, Component, ElementRef, Input, OnInit } from '@angular/core';
import { AbstractFieldReadComponent } from '../../../base-field/abstract-field-read.component';
import { CaseField } from '../../../../../domain/definition';
import { switchMap } from 'rxjs/operators';
import { OrganisationService, OrganisationVm } from '../../../../../services/organisation';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { OrganisationConverter, SimpleOrganisationModel } from '../../../../../domain/organisation';
import { CaseLink } from '../../domain/linked-cases.model';
import { CaseView } from '../../../../../domain';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SearchService } from '../../../../../services/search/search.service';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-table',
  templateUrl: './linked-cases-table.component.html'
})

export class LinkedCasesTableComponent extends AbstractFieldReadComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;
  @Input()
  public type: PageType = PageType.LINKEDCASESTABLBEVIEW;
  pageType = PageType;

  public sub: Subscription;
  caseDetails: CaseView;
  parentUrl: string;
  isLoaded: boolean;
  linkedCasesFromResponse: any = []

  public organisations$: Observable<OrganisationVm[]>;
  public selectedOrg$: Observable<SimpleOrganisationModel>;

  constructor(
    private route: ActivatedRoute,
    private readonly searchService: SearchService    ) {
      super();
    }
  ngAfterViewInit(): void {
    const labelField = document.getElementsByClassName('case-viewer-label');
    if(labelField) {
      labelField[0].replaceWith('')
    }
  }

  ngOnInit(): void {
    this.getAllCaseInformation();
    this.route.parent.url.subscribe(path => {
      this.parentUrl = `/${path.join('/')}`;
    });
  }

  groupByCaseType = (arrObj, key) => {
    return arrObj.reduce((rv, x) => {
      (rv[x[key]] = rv[x[key]] || []).push(x['caseReference']);
      return rv;
    }, {});
  };

  public getAllCaseInformation() {
    const hearingServices = [];
    const caseTypeId = this.route.snapshot.data.case.case_type.id;
    const linkedCaseIds = this.groupByCaseType(this.caseField.value, 'caseType');
    Object.keys(linkedCaseIds).map(key => {
      const esQuery = this.constructElasticSearchQuery(linkedCaseIds[key], 100)
      const query = this.searchService.searchCases('Benefit_SCSS', {}, {reference: linkedCaseIds[key].join(',')}, SearchService.VIEW_WORKBASKET);
      hearingServices.push(query);
    })
    this.sub = forkJoin(hearingServices).subscribe((hearingsList: any) => {
      hearingsList.forEach(response => response.results.map((result: any) => this.linkedCasesFromResponse.push(result)))
      this.isLoaded = true;
    });
  }

  constructElasticSearchQuery(caseIds: any[], size: number) {
    return {
      native_es_query: {
        query: {
          terms: {
            reference: caseIds,
          },
        },
        sort: [
          // does not seem to allow sorting by case name (attempted both pre and post v6.8 syntax)
          // this is either because case name not present for all cases or because nested data cannot be sorted in this instance
          // { "case_data.caseName": {mode: "max", order: "asc", nested_path: "case_data"}},
          { id: {order: 'asc'} },
        ],
        size,
      },
      supplementary_data: ['*'],
    };
  }
}
