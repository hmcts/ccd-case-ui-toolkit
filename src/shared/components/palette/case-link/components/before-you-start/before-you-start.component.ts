import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent implements OnInit {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public isLinkCasesJourney: boolean;

  constructor(private router: Router) {
  }

  public ngOnInit(): void {
    this.isLinkCasesJourney = this.router && this.router.url && this.router.url.includes('linkCases');
  }

  public onNext(): void {
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    });
  }
}
