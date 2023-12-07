import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { ErrorMessage } from '../../../domain';
import { CaseView } from '../../../domain/case-view';
import { CommonDataService } from '../../../services/common-data-service/common-data-service';
import { CasesService } from '../../case-editor/services/cases.service';
import { AbstractFieldWriteComponent } from '../base-field';
import { CaseLink, LinkedCasesState } from './domain';
import { LinkedCasesErrorMessages, LinkedCasesEventTriggers, LinkedCasesPages } from './enums';
import { LinkedCasesService } from './services';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html'
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteComponent implements OnInit, AfterViewInit {
  public caseEditForm: FormGroup;
  public caseDetails: CaseView;
  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public linkedCases: CaseLink[] = [];

  constructor(
    private readonly appConfig: AbstractAppConfig,
    private readonly commonDataService: CommonDataService,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService,
    private readonly caseEditDataService: CaseEditDataService) {
    super();
  }

  public ngOnInit(): void {
    // This is required to enable Continue button validation
    // Continue button should be enabled only at check your answers page
    this.caseEditDataService.setLinkedCasesJourneyAtFinalStep(false);
    // Clear validation errors
    this.caseEditDataService.clearFormValidationErrors();
    // Get linked case reasons from ref data
    this.getLinkedCaseReasons();
    this.linkedCasesService.editMode = false;
    this.caseEditDataService.caseDetails$.subscribe({
      next: caseDetails => this.initialiseCaseDetails(caseDetails)
    });
    this.caseEditDataService.caseEventTriggerName$.subscribe({
      next: name => this.linkedCasesService.isLinkedCasesEventTrigger = (name === LinkedCasesEventTriggers.LINK_CASES)
    });
    this.caseEditDataService.caseEditForm$.subscribe({
      next: editForm => this.caseEditForm = editForm
    });
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
          this.caseEditDataService.addFormValidationError({ id: errorMessage.fieldId, message: errorMessage.description});
        });
      }
    }
  }

  public getLinkedCaseReasons(): void {
    const reasonCodeAPIurl = `${this.appConfig.getRDCommonDataApiUrl()}/lov/categories/CaseLinkingReasonCode`;
      this.commonDataService.getRefData(reasonCodeAPIurl).subscribe({
        next: reasons => {
          // Sort in ascending order
          const linkCaseReasons = reasons.list_of_values.sort((a, b) => (a.value_en > b.value_en) ? 1 : -1);
          // Move Other option to the end of the list
          this.linkedCasesService.linkCaseReasons = linkCaseReasons?.filter(reason => reason.value_en !== 'Other');
          this.linkedCasesService.linkCaseReasons.push(linkCaseReasons?.find(reason => reason.value_en === 'Other'));
        }
    });
  }

  public proceedToNextPage(): void {
    if (this.isAtFinalPage()) {
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
  }

  public submitLinkedCases(): void {
    if (!this.linkedCasesService.isLinkedCasesEventTrigger) {
      const unlinkedCaseRefereneIds = this.linkedCasesService.linkedCases.filter(item => item.unlink).map(item => item.caseReference);
      const caseFieldValue = this.linkedCasesService.caseFieldValue;
      this.linkedCasesService.caseFieldValue = caseFieldValue.filter(item => unlinkedCaseRefereneIds.indexOf(item.id) === -1);
    }
    this.formGroup.value.caseLinks = this.linkedCasesService.caseFieldValue;
    (this.caseEditForm.controls['data'] as any) = new FormGroup({caseLinks: new FormControl(this.linkedCasesService.caseFieldValue || [])});
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
          ({field_type}) => field_type && field_type.collection_field_type && field_type.collection_field_type.id === 'CaseLink'
        );
      });
      if (caseViewFiltered) {
        const caseLinkFieldValue = caseViewFiltered.map(filtered =>
          filtered.fields?.length > 0 && filtered.fields.filter(field => field.id === 'caseLinks')[0].value
        );
        this.linkedCasesService.caseFieldValue = caseLinkFieldValue.length ? caseLinkFieldValue[0] : [];
        this.linkedCasesService.getAllLinkedCaseInformation();
      }
      // Initialise the first page to display
      this.linkedCasesPage = this.linkedCasesService.isLinkedCasesEventTrigger ||
                        (this.linkedCasesService.caseFieldValue && this.linkedCasesService.caseFieldValue.length > 0
                          && !this.linkedCasesService.serverLinkedApiError)
        ? LinkedCasesPages.BEFORE_YOU_START
        : LinkedCasesPages.NO_LINKED_CASES;
    });
  }
}
