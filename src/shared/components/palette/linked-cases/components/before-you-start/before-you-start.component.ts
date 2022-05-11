import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorMessage } from '../../../../../domain';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesEventTriggers, LinkedCasesPages } from '../../enums';

@Component({
  selector: 'ccd-linked-cases-before-you-start',
  templateUrl: './before-you-start.component.html'
})
export class BeforeYouStartComponent  {

	@Input()
	public eventTriggerId: string;

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

	public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public errorMessages: ErrorMessage[];

  public onNext(): void {
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({ currentLinkedCasesPage: LinkedCasesPages.BEFORE_YOU_START, errorMessages: this.errorMessages });
  }
}
