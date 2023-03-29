import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseField, CaseTab } from '../../../domain';
import { CommonDataService } from '../../../services/common-data-service/common-data-service';
import { LinkedCasesService } from './services';

@Component({
  selector: 'ccd-read-linked-cases-field',
  templateUrl: './read-linked-cases-field.component.html',
  styleUrls: ['./read-linked-cases-field.component.scss']
})
export class ReadLinkedCasesFieldComponent implements OnInit, AfterViewInit {

  public caseField: CaseField;
  public reasonListLoaded = false;
  public reload = false;
  public serverError: { id: string, message: string } = null;
  public serverLinkedApiError: { id: string, message: string } = null;
  public isServerReasonCodeError = false;
  public isServerJurisdictionError = false;
  public isServerLinkedFromError = false;
  public isServerLinkedToError = false;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly appConfig: AbstractAppConfig,
    private readonly commonDataService: CommonDataService,
  ) { }

  public ngOnInit(): void {
    if (this.route.snapshot.data.case && this.route.snapshot.data.case.tabs) {
      const tabs = this.route.snapshot.data.case.tabs as CaseTab[];
      const tab = tabs?.filter(tabItem => tabItem.fields?.some(field => field.id === 'caseLinks'))[0];
      this.caseField = tab?.fields?.find(field => field.id === 'caseLinks');
    }
    this.isServerJurisdictionError = this.linkedCasesService.serverJurisdictionError || false;
    const reasonCodeAPIurl = this.appConfig.getRDCommonDataApiUrl() + '/lov/categories/CaseLinkingReasonCode';
    this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
      next: reasons => {
        this.reasonListLoaded = true;
        this.linkedCasesService.linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
      },
      error: () => {
        this.isServerReasonCodeError = true;
        this.linkedCasesService.isServerReasonCodeError = true;
      }
    });
    this.serverLinkedApiError = {
      id: 'backendError', message: 'Some case information is not available at the moment'
    };
    this.serverError = {
      id: 'backendError', message: 'There has been a system error and your request could not be processed.'
    };
  }

  public ngAfterViewInit(): void {
    this.linkedCasesService.caseFieldValue = this.caseField?.value || [];
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
    labelField = document.getElementsByClassName('case-viewer-label');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  public reloadCurrentRoute(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseDetails.case_id], { fragment: 'Linked cases' });
  }

  public getFailureLinkedToNotification(evt): void {
    this.isServerLinkedToError = true;
  }

  public getFailureLinkedFromNotification(evt): void {
    this.isServerLinkedFromError = true;
  }
}
