import { Component, Input, OnInit } from '@angular/core';
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

export class LinkedCasesTableComponent implements OnInit {
  @Input()
  caseFields: CaseField[] = [];

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
    private organisationService: OrganisationService,
    private organisationConverter: OrganisationConverter,
    private route: ActivatedRoute,
    private readonly http: HttpClient,
    private readonly searchService: SearchService
    ) {
  }

  ngOnInit(): void {
    this.getAllCaseInformation();
    this.route.parent.url.subscribe(path => {
      this.parentUrl = `/${path.join('/')}`;
    });
    if (this.caseField && this.caseField.value) {
      this.organisations$ = this.organisationService.getActiveOrganisations();
      this.selectedOrg$ = this.organisations$.pipe(
        switchMap((organisations: OrganisationVm[]) => of(
            this.organisationConverter.toSimpleOrganisationModel(
              organisations.find(findOrg => findOrg.organisationIdentifier === this.caseField.value.OrganisationID)
            )
          )
        )
      );
    }
  }

  public getAllCaseInformation() {
    console.log('this.route.snapshot.data')
    console.log(this.route.snapshot.data)
    const receivedCases: any[] = this.route.snapshot.data.linkedCase && this.route.snapshot.data.linkedCase.serviceLinkedCases || [];
    const linkedCaseIds: string[] = [''];
    const hearingServices = [];
    linkedCaseIds.forEach(id => {
      const query = this.searchService.searchCases('Benefit_SCSS', {}, {}, SearchService.VIEW_WORKBASKET);
      hearingServices.push(query);
    });
    this.sub = forkJoin(hearingServices).subscribe((hearingsList: any) => {
      hearingsList.forEach(response => response.results.map((result: any) => this.linkedCasesFromResponse.push(result)))
      this.isLoaded = true;
    });
  }

  constructElasticSearchQuery(caseIds: any[], page: number, size: number) {
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
