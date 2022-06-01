import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseView } from '../../../../domain/case-view';
import { CaseEditPageComponent } from '../../../case-editor/case-edit-page/case-edit-page.component';
import { CasesService } from '../../../case-editor/services/cases.service';
import { AbstractFieldWriteComponent } from '../../base-field';
import { CaseLink, LinkedCasesState } from '../domain';
import { LinkedCasesErrorMessages, LinkedCasesEventTriggers, LinkedCasesPages } from '../enums';
import { LinkedCasesService } from '../services';

@Component({
  selector: 'ccd-write-linked-cases',
  templateUrl: './write-linked-cases.component.html'
})
export class WriteLinkedCasesComponent extends AbstractFieldWriteComponent implements OnInit {

  private static readonly LINKED_CASES_TAB_ID = 'linked_cases_sscs';

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  public formGroup: FormGroup;
  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public linkedCases: CaseLink[] = [];
  public isLinkedCasesJourney: boolean;

  constructor(private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly linkedCasesService: LinkedCasesService) {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): {[key: string]: boolean} | null => {
        if (!this.isAtFinalPage()) {
          // Return an error to mark the FormGroup as invalid if not at the final page
          return {notAtFinalPage: true};
        }
        return null;
      }
    }), true) as FormGroup;

    // Figure out the journey, linked cases or manage linked cases
    this.isLinkedCasesJourney = this.router && this.router.url && this.router.url.includes(LinkedCasesEventTriggers.LINK_CASES);
    // Store caseId in LinkedCasesService, to be used by child components
    this.linkedCasesService.caseId = this.caseEditPageComponent.getCaseId();
    // Get linked cases
    this.getLinkedCases();
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    this.caseEditPageComponent.validationErrors = [];

    if (linkedCasesState.navigateToNextPage) {
      this.linkedCasesPage = this.getNextPage(linkedCasesState);
      this.setContinueButtonValidationErrorMessage();
      this.proceedToNextPage();
    } else {
      linkedCasesState.errorMessages.forEach(errorMessage => {
        this.caseEditPageComponent.validationErrors.push({ id: errorMessage.fieldId, message: errorMessage.description});
      });
    }
  }

  public setContinueButtonValidationErrorMessage(): void {
    const errorMessage = this.linkedCasesService.linkedCases.length === 0
      ? LinkedCasesErrorMessages.BackNavigationError
      : this.router && this.router.url && this.router.url.includes(LinkedCasesEventTriggers.LINK_CASES)
        ? LinkedCasesErrorMessages.LinkCasesNavigationError
        : LinkedCasesErrorMessages.UnlinkCasesNavigationError;

    const buttonId = this.linkedCasesService.linkedCases.length === 0
      ? 'back-button'
      : 'next-button';

    this.caseEditPageComponent.caseLinkError = {
      componentId: buttonId,
      errorMessage: errorMessage
    };
  }

  public proceedToNextPage(): void {
    if (this.isAtFinalPage()) {
      // Continue button event must be allowed in final page
      this.caseEditPageComponent.caseLinkError = null;
      // Trigger validation to clear the "notAtFinalPage" error if now at the final state
      this.formGroup.updateValueAndValidity();
    }
  }

  public isAtFinalPage(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getNextPage(linkedCasesState: LinkedCasesState): number {
    if ((this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START) ||
        (linkedCasesState.currentLinkedCasesPage === LinkedCasesPages.CHECK_YOUR_ANSWERS && linkedCasesState.navigateToPreviousPage)) {
          return this.isLinkedCasesJourney
            ? LinkedCasesPages.LINK_CASE
            : LinkedCasesPages.UNLINK_CASE;
    }
    return LinkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getLinkedCases(): void {
    this.casesService.getCaseViewV2(this.linkedCasesService.caseId).subscribe((caseView: CaseView) => {
      const linkedCasesTab = caseView.tabs.find(tab => tab.id === WriteLinkedCasesComponent.LINKED_CASES_TAB_ID);
      if (linkedCasesTab) {
        const linkedCases: CaseLink[] = linkedCasesTab.fields[0].value;
        // Store linked cases in linked cases service
        this.linkedCasesService.linkedCases = linkedCases || [];
        // Initialise the first page to display
        this.linkedCasesPage = this.isLinkedCasesJourney || (linkedCases && linkedCases.length > 0)
          ? LinkedCasesPages.BEFORE_YOU_START
          : LinkedCasesPages.NO_LINKED_CASES;
        // Initialise the error to be displayed when clicked on Continue button
        this.setContinueButtonValidationErrorMessage();
      }
    });
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }
}
