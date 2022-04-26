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
import { PaginationInstance } from "ngx-pagination";
import { HttpService, OptionsType } from "../../../services/http/http.service";
import { RequestOptionsBuilder } from "../../../services/request/request.options.builder";

@Component({
  selector: "ccd-multiple-demo",
  templateUrl: "./multiple-demo.component.html",
})
export class MultipleDemoComponent extends AbstractFieldReadComponent {  
  autoHide = true;

  pageChanged(event: number) {
    this.config.currentPage = event;
    this.getPageData(event);
  }

  config: PaginationInstance = {
    itemsPerPage: this.appConfig.getPaginationPageSize(),
    currentPage: 1
  };

  resultView: any[];

  constructor(
    private appConfig: AbstractAppConfig,
    private readonly sessionStorage: SessionStorageService,
    private httpService: HttpService,
    private searchService: SearchService,
    private casesService: CasesService,
    private requestOptionsBuilder: RequestOptionsBuilder
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
      'ctid': caseDetail.case_type,
      'use_case': SearchService.VIEW_SEARCH,      
    }
    const caseCriteria = {  
      'multipleReference':  caseDetail.data['multipleReference']
    }

    let options: OptionsType = this.requestOptionsBuilder.buildOptions(metaCriteria, caseCriteria, SearchService.VIEW_SEARCH);
    let returnedRecords: SearchResultViewWithTotal = await this.httpService.post('/data/internal/searchCases', body, options).toPromise();

    this.config.totalItems = returnedRecords.total;
    this.resultView = returnedRecords.results.map(result => result.case_fields);
  }

  hasResults(): any {
    if (this.resultView) {
      return this.resultView.length;
    } else {
      return 0;
    }
  }
}
