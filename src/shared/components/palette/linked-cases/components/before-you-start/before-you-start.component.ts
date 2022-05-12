import { Component, EventEmitter, Output } from '@angular/core';
import { ErrorMessage } from '../../../../../domain';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent  {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  errorMessages: ErrorMessage[];

  public onNext(): void {
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({ currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START, errorMessages: this.errorMessages });
  }
}
