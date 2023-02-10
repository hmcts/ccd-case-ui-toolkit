import { HttpClient } from "@angular/common/http";
import { Component, OnInit } from "@angular/core";
import { AbstractAppConfig } from "../../../../app.config";
import { SearchResultView } from "../../../domain";
import { SearchService } from "../../../services/search/search.service";
import { SessionStorageService } from "../../../services/session/session-storage.service";
import { CasesService } from "../../case-editor/services/cases.service";
import { AbstractFieldReadComponent } from "../base-field/abstract-field-read.component";

@Component({
  selector: "ccd-lead-demo",
  templateUrl: "./lead-demo.component.html",
})
export class LeadDemoComponent extends AbstractFieldReadComponent {
  resultView: SearchResultView;

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
            //caseDetail.case_type,
            'ET_EnglandWales',
            {},
            {
              multipleReference: caseDetail.data['multipleReference'],
              leadClaimant: 'Yes',
            },
            SearchService.VIEW_SEARCH
          )
          .toPromise()
          .then((data: SearchResultView) => (this.resultView = data))
          .catch((err) => {
            console.log(err);
            this.resultView = null;
          });
      });
  }

  hasResults(): any {
    if (this.resultView) {
      return this.resultView.results.length;
    } else {
      return 0;
    }
  }
}
