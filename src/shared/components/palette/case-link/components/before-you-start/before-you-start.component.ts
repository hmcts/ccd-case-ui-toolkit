import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMessage } from '../../../../../domain';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent {
  public hasAnyAPIFailure = false;

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public isLinkCasesJourney = false;

  public errorMessages: ErrorMessage[];

  constructor(private readonly router: Router, private readonly linkedCasesService: LinkedCasesService) {
    this.isLinkCasesJourney = this.linkedCasesService.isLinkedCasesEventTrigger;
    // re-initiate the state based on the casefield value
    this.hasAnyAPIFailure = this.linkedCasesService && this.linkedCasesService.serverLinkedApiError != null;
    const linkedCaseRefereneIds = this.linkedCasesService.caseFieldValue.filter(item => item).map(item => item.id);
    this.linkedCasesService.linkedCases = this.linkedCasesService.linkedCases.filter
                                      (item => linkedCaseRefereneIds.indexOf(item.caseReference) !== -1);
    this.linkedCasesService.initialCaseLinks = this.linkedCasesService.linkedCases;
  }

  public onNext(): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      errorMessages: this.errorMessages,
      navigateToNextPage: true
    });
  }

  public onBack(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseId]).then(() => {
      window.location.hash = 'Linked cases';
    });
  }
}
