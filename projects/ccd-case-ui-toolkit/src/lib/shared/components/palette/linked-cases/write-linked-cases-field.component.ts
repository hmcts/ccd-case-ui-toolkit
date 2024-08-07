import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { CaseView } from '../../../domain/case-view';
import { CommonDataService } from '../../../services/common-data-service/common-data-service';
import { CasesService } from '../../case-editor/services/cases.service';
import { AbstractFieldWriteJourneyComponent } from '../base-field';
import { CaseLink, LinkedCasesState } from './domain';
import { LinkedCasesEventTriggers, LinkedCasesPages } from './enums';
import { LinkedCasesService } from './services';
import { Subscription } from 'rxjs';
import { MultipageComponentStateService } from '../../../services';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html'
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteJourneyComponent implements OnInit, AfterViewInit, OnDestroy {
  public caseEditForm: FormGroup;
  public caseDetails: CaseView;
  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public linkedCases: CaseLink[] = [];
  private subscriptions = new Subscription();

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private readonly commonDataService: CommonDataService,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly caseEditDataService: CaseEditDataService,
    multipageComponentStateService: MultipageComponentStateService) {
    super(multipageComponentStateService);
  }

  public ngOnInit(): void {
    // This is required to enable Continue button validation
    // Continue button should be enabled only at check your answers page
    this.caseEditDataService.setLinkedCasesJourneyAtFinalStep(false);
    // Clear validation errors
    this.caseEditDataService.clearFormValidationErrors();
    // Get linked case reasons from ref data
    this.linkedCasesService.editMode = false;
    this.subscriptions.add(this.caseEditDataService.caseDetails$.subscribe(
      {
        next: caseDetails => { this.initialiseCaseDetails(caseDetails); }
      }));
    this.getOrgService();
    this.subscriptions.add(this.caseEditDataService.caseEventTriggerName$.subscribe({
      next: name => this.linkedCasesService.isLinkedCasesEventTrigger = (name === LinkedCasesEventTriggers.LINK_CASES)
    }));
    this.subscriptions.add(this.caseEditDataService.caseEditForm$.subscribe({
      next: editForm => this.caseEditForm = editForm
    }));

    this.journeyPageNumber = this.journeyStartPageNumber = LinkedCasesPages.BEFORE_YOU_START;
    this.journeyEndPageNumber = LinkedCasesPages.CHECK_YOUR_ANSWERS;

    if (this.linkedCasesService.cameFromFinalStep){
      this.linkedCasesPage = LinkedCasesPages.CHECK_YOUR_ANSWERS;
      this.journeyPageNumber = LinkedCasesPages.CHECK_YOUR_ANSWERS;
      this.caseEditDataService.setLinkedCasesJourneyAtFinalStep(true);
    }

    this.multipageComponentStateService.isAtStart = this.journeyPageNumber === this.journeyStartPageNumber;
  }

  public onPageChange(): void {
    const isAtStart: boolean = this.journeyPageNumber === this.journeyStartPageNumber || this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START;
    this.multipageComponentStateService.isAtStart = isAtStart;
  }

  public initialiseCaseDetails(caseDetails: CaseView): void {
    if (caseDetails) {
      this.caseDetails = caseDetails;
      this.linkedCasesService.caseDetails = caseDetails;
      this.linkedCasesService.caseId = caseDetails.case_id;
      this.linkedCasesService.caseName = this.linkedCasesService.getCaseName(caseDetails);
      this.getLinkedCases();
    }
  }

  public ngAfterViewInit(): void {
    let labelField = document.getElementsByClassName('govuk-heading-l');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
    labelField = document.getElementsByClassName('heading-h2');
    if (labelField && labelField.length) {
      labelField[0].replaceWith('');
    }
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    // Clear validation errors
    this.caseEditDataService.clearFormValidationErrors();
    if (linkedCasesState.navigateToNextPage) {
      this.linkedCasesPage = this.getNextPage(linkedCasesState);
      this.proceedToNextPage();
    } else {
      if (linkedCasesState.errorMessages && linkedCasesState.errorMessages.length) {
        linkedCasesState.errorMessages.forEach((errorMessage, index) => {
          this.caseEditDataService.addFormValidationError({ id: errorMessage.fieldId, message: errorMessage.description });
        });
      }
    }
  }

  public getLinkedCaseReasons(serviceId: string): void {
    const reasonCodeAPIurl = `${this.appConfig.getRDCommonDataApiUrl()}/lov/categories/CaseLinkingReasonCode?serviceId=${serviceId}`;
    this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
      next: (reasons) => {
        // Sort in ascending order
        const linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);

        this.linkedCasesService.linkCaseReasons = linkCaseReasons?.filter((reason) => reason.value_en !== 'Other');
        // Move Other option to the end of the list
        this.linkedCasesService.linkCaseReasons.push(linkCaseReasons?.find((reason) => reason.value_en === 'Other'));
      }
    });
  }

  getOrgService(): void {
    const servicesApiUrl = `refdata/location/orgServices?ccdCaseType=${this.caseDetails?.case_type?.id}`;
    this.commonDataService.getServiceOrgData(servicesApiUrl).subscribe((result) => {
      result.forEach((ids) => {
        this.getLinkedCaseReasons(ids.service_code);
      });
    });
  }

  public proceedToNextPage(): void {
    if (this.isAtFinalPage()) {
      // Set the journey page to the end page. 
      this.journeyPageNumber = this.journeyEndPageNumber;
      // Continue button event must be allowed in final page
      this.caseEditDataService.setLinkedCasesJourneyAtFinalStep(true);
      // Trigger validation to clear the "notAtFinalPage" error if now at the final state
      this.formGroup.updateValueAndValidity();
      // update form value
      this.submitLinkedCases();
    } else {
      // Continue button event must not be allowed if not in final page
      this.caseEditDataService.setLinkedCasesJourneyAtFinalStep(false);
    }

    this.nextPage();
  }

  public submitLinkedCases(): void {
    if (!this.linkedCasesService.isLinkedCasesEventTrigger) {
      const unlinkedCaseRefereneIds = this.linkedCasesService.linkedCases.filter(item => item.unlink).map(item => item.caseReference);
      const caseFieldValue = this.linkedCasesService.caseFieldValue;
      this.linkedCasesService.caseFieldValue = caseFieldValue.filter(item => unlinkedCaseRefereneIds.indexOf(item.id) === -1);
    }

    this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue;
    (this.caseEditForm.controls['data'] as any) = new FormGroup({ caseLinks: new FormControl(this.linkedCasesService.caseFieldValue || []) });
    this.caseEditDataService.setCaseEditForm(this.caseEditForm);
  }

  public isAtFinalPage(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getNextPage(linkedCasesState: LinkedCasesState): number {
    if ((this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START) ||
      (linkedCasesState.currentLinkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS && linkedCasesState.navigateToPreviousPage)) {
      return this.linkedCasesService.isLinkedCasesEventTrigger
        ? LinkedCasesPages.LINK_CASE
        : LinkedCasesPages.UNLINK_CASE;
    }
    return LinkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getLinkedCases(): void {
    this.casesService.getCaseViewV2(this.linkedCasesService.caseId).subscribe((caseView: CaseView) => {
      const caseViewFiltered = caseView.tabs.filter(tab => {
        return tab.fields.some(
          ({ field_type }) => field_type && field_type.collection_field_type && field_type.collection_field_type.id === 'CaseLink'
        );
      });
      if (caseViewFiltered) {
        const caseLinkFieldValue = caseViewFiltered.map(filtered =>
          filtered.fields?.length > 0 && filtered.fields.filter(field => field.id === 'caseLinks')[0].value
        );
        if (!this.linkedCasesService.caseFieldValue.length){
          this.linkedCasesService.caseFieldValue = caseLinkFieldValue.length ? caseLinkFieldValue[0] : [];
          this.linkedCasesService.getAllLinkedCaseInformation();
        }
      }
      // Initialise the first page to display
      if (!this.linkedCasesService.cameFromFinalStep){
        this.linkedCasesPage = this.linkedCasesService.isLinkedCasesEventTrigger ||
        (this.linkedCasesService.caseFieldValue && this.linkedCasesService.caseFieldValue.length > 0
          && !this.linkedCasesService.serverLinkedApiError)
          ? LinkedCasesPages.BEFORE_YOU_START
          : LinkedCasesPages.NO_LINKED_CASES;
      }
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public previousPage(): void {
    if (this.linkedCasesService.isLinkedCasesEventTrigger){
      if (this.linkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS) {
        this.linkedCasesPage = LinkedCasesPages.LINK_CASE;
      } else if (this.linkedCasesPage === LinkedCasesPages.LINK_CASE) {
        this.linkedCasesPage = LinkedCasesPages.BEFORE_YOU_START;
      } else {
        this.linkedCasesPage --;
      }
    } else {
      if (this.linkedCasesPage === LinkedCasesPages.UNLINK_CASE){
        this.linkedCasesPage = this.linkedCasesPages.BEFORE_YOU_START;
      } else if (this.linkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS) {
        this.linkedCasesPage = this.linkedCasesPages.UNLINK_CASE;
      } else {
        this.linkedCasesPage --;
      }
    }
    super.previousPage();
  }
}
