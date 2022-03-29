import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
import { AbstractAppConfig } from "../../../../app.config";
import {
  SearchResultView,
} from "../../../domain";
import { SessionStorageService } from "../../../services/session/session-storage.service";
import { AbstractFieldReadComponent } from "../base-field/abstract-field-read.component";
import { SearchService } from "../../../services/search/search.service";
import { CasesService } from "../../case-editor/services";
import { PaginationInstance } from "ngx-pagination";

@Component({
  selector: "ccd-multiple-demo",
  templateUrl: "./multiple-demo.component.html",
})
export class MultipleDemoComponent extends AbstractFieldReadComponent { 
  autoHide = true;

  pageChanged(event: number) {
    this.config.currentPage = event;
  }

  config: PaginationInstance = {
    itemsPerPage: 4,
    currentPage: 1
  };

  resultView: any[];

  constructor(
    private appConfig: AbstractAppConfig,
    private readonly sessionStorage: SessionStorageService,
    private http: HttpClient,
    private searchService: SearchService,
    private casesService: CasesService
  ) {
    super();
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.casesService
      .getCaseData(this.caseReference)
      .toPromise()
      .then((caseDetail) => {
        this.searchService
          .searchCases(
            caseDetail.case_type,
            {},
            { multipleReference: caseDetail.data['multipleReference'] },
            SearchService.VIEW_SEARCH
          )
          .toPromise()
          .then((data: SearchResultView) => {                   
            this.resultView = data.results.map(result => result.case_fields);
          })
          .catch((err) => {
            console.log(err);
            this.resultView = null;
          });
      });

  }  

  hasResults(): any {
    if (this.resultView) {
      return this.resultView.length;
    } else {
      return 0;
    }
  } 
}
