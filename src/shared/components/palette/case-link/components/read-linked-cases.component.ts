import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractAppConfig } from '../../../../../app.config';
import { CaseField } from '../../../../domain';
import { CommonDataService } from '../../../../services/common-data-service/common-data-service';
import { LinkedCasesService } from '../services';

@Component({
  selector: 'ccd-read-linked-cases',
  templateUrl: './read-linked-cases.component.html'
})
export class ReadLinkedCasesComponent implements OnInit {

  @Input()
  caseField: CaseField;

  public reasonListLoaded = false;
  public reload = false
  public serverError: { id: string, message: string } = null;

  constructor(private router: Router,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly appConfig: AbstractAppConfig,
    private commonDataService: CommonDataService,

    ) {}

    public ngOnInit(): void {
      const reasonCodeAPIurl = this.appConfig.getRDCommonDataApiUrl() + '/lov/categories/CaseLinkingReasonCode';
      this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
        next: reasons => {
          this.reasonListLoaded = true;
          this.linkedCasesService.linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
        },
        error: error => this.getFailureNotification(error)
      })
    }

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl], {
      queryParams: {refresh: new Date().getTime()}
   });
  }

  getFailureNotification(evt) {
    const errorMessage = 'There has been a system error and your request could not be processed.';
    this.serverError = {
      id: 'backendError', message: errorMessage
    };
  }
}
