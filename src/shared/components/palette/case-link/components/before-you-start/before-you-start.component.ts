import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';
import { LinkedCasesService } from '../../services/linked-cases.service';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public isLinkCasesJourney = false;

  constructor(
    private readonly linkedCasesService: LinkedCasesService,
  ) {
    this.isLinkCasesJourney = this.linkedCasesService.isLinkedCasesEventTrigger;
  }

  public onNext(): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    });
  }
}
