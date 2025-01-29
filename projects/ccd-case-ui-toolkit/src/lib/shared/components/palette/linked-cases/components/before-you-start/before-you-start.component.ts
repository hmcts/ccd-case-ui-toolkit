import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorMessage, Journey } from '../../../../../domain';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';
import { AbstractJourneyComponent } from '../../../base-field';
import { MultipageComponentStateService } from '../../../../../services';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent extends AbstractJourneyComponent implements Journey {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public isLinkCasesJourney = false;
  public errorMessages: ErrorMessage[];
  public serverLinkedApiError: { id: string, message: string };

  constructor(private readonly router: Router,
    private readonly linkedCasesService: LinkedCasesService,
    multipageComponentStateService: MultipageComponentStateService) {
    super(multipageComponentStateService);
    this.isLinkCasesJourney = this.linkedCasesService.isLinkedCasesEventTrigger;
    this.serverLinkedApiError = this.linkedCasesService.serverLinkedApiError;
    // re-initiate the state based on the casefield value
    const linkedCaseReferenceIds = this.linkedCasesService.caseFieldValue.filter((item) => item).map((item) => item.id);
    this.linkedCasesService.linkedCases = this.linkedCasesService.linkedCases.filter((item) => linkedCaseReferenceIds.indexOf(item.caseReference) !== -1);
    if (this.linkedCasesService.linkedCases.length === 0 && this.linkedCasesService.caseFieldValue.length !== 0 && !this.linkedCasesService.hasContinuedFromStart) {
      this.linkedCasesService.caseFieldValue.forEach((item) => {
        this.linkedCasesService.initialCaseLinkRefs.push(item.id);
      });
    } else {
      this.linkedCasesService.linkedCases.forEach((item) => {
        this.linkedCasesService.initialCaseLinkRefs.push(item.caseReference);
      });
      this.linkedCasesService.initialCaseLinks = this.linkedCasesService.linkedCases;
    }
  }

  public next(): void {
    this.linkedCasesService.hasContinuedFromStart = true;
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      errorMessages: this.errorMessages,
      navigateToNextPage: true
    });

    const isAnArray: boolean = Array.isArray(this.errorMessages);
    const isNotAnArray: boolean = !isAnArray;
    const isValid: boolean = (isAnArray && this.errorMessages.length === 0) || isNotAnArray;

    if (isValid) {
      super.next();
    }
  }

  public onBack(): void {
    this.router.navigate(['cases', 'case-details', this.linkedCasesService.caseId], { fragment: 'Linked cases' });
  }
}
