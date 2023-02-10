import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { AbstractAppConfig } from "../../../../app.config";
import {
  SearchResultView, SearchResultViewWithTotal,
} from "../../../domain";
import { SessionStorageService } from "../../../services/session/session-storage.service";
import { AbstractFieldReadComponent } from "../base-field/abstract-field-read.component";
import { SearchService } from "../../../services/search/search.service";
import { CasesService } from "../../case-editor/services";

import { HttpService, OptionsType } from "../../../services/http/http.service";
import { RequestOptionsBuilder } from "../../../services/request/request.options.builder";
import { SelectionModel } from "@angular/cdk/collections";
import { MultipleService } from "../../../services/multiple/multiple.service";
import { ActivatedRoute, Router } from "@angular/router";
import { PaginationInstance } from "ngx-pagination/lib/ngx-pagination.module";


@Component({
  selector: "ccd-multiple-demo",
  templateUrl: "./multiple-demo.component.html",
  styleUrls: ['./multiple-demo.component.scss']
})
export class MultipleDemoComponent extends AbstractFieldReadComponent {
  static readonly CASE_REFERENCE = '[CASE_REFERENCE]';
  autoHide = true;



  pageChanged(event: number) {
    this.selection.clear();
    this.config.currentPage = event;
    this.getPageData(event);
  }

  config: PaginationInstance = {
    itemsPerPage: this.appConfig.getPaginationPageSize(),
    currentPage: 1
  };

  resultView: any[];

  selection = new SelectionModel<any>(true, []);

  public displayedColumns: string[] = [
    'select',
    'ethosCaseReference',
    'claimant',
    'respondent',
    'leadClaimant',
  ];

  constructor(
    private appConfig: AbstractAppConfig,
    private readonly sessionStorage: SessionStorageService,
    private httpService: HttpService,
    private searchService: SearchService,
    private casesService: CasesService,
    private requestOptionsBuilder: RequestOptionsBuilder,
    private multipleService: MultipleService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    super.ngOnInit();
    this.getPageData(1);
  }

  async getPageData(page: number) {
    const caseDetail = await this.casesService.getCaseData(this.caseReference).toPromise();

    const body = {
      size: this.appConfig.getPaginationPageSize(),
      sort: {
        column: 'ethosCaseReference',
        order: 0,
        type: 'Text'
      }
    }

    const metaCriteria = {
      'page': page,
      'ctid':  'ET_EnglandWales',
      //'ctid':  caseDetail.case_type,
      'use_case': SearchService.VIEW_SEARCH
    }

    const caseCriteria = {
      'multipleReference': caseDetail.data['multipleReference']
    }

    let options: OptionsType = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, SearchService.VIEW_SEARCH);
    let returnedRecords: SearchResultViewWithTotal = await this.httpService.post('/data/internal/searchCases', body, options).toPromise();

    this.config.totalItems = returnedRecords.total;
    this.resultView = returnedRecords.results.map(result => result.case_fields);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.resultView.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.resultView.forEach(row => this.selection.select(row));
  }

  moveToMultiple(multipleRef: string) {

    let caseIds = this.selection.selected.map(data => { return { caseId: data["[CASE_REFERENCE]"], caseReference: data.ethosCaseReference } });

    let updateMultipleRequest = { multipleReference: multipleRef, cases: caseIds }

    console.log(updateMultipleRequest);
    console.log(this.selection.selected);

    this.multipleService.removeCaseFromMultiple(updateMultipleRequest);

    return this.router.navigate(['cases'], { relativeTo: this.route });


  }

  hasResults(): any {
    if (this.resultView) {
      return this.resultView.length;
    } else {
      return 0;
    }
  }
}
