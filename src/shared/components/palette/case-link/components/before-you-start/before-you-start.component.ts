import { Component, EventEmitter, Output } from '@angular/core';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  constructor() {
  }

  public onNext(): void {
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START,
      navigateToNextPage: true
    });
  }
}
