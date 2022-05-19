import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ErrorMessage } from '../../../../../domain';
import { LinkedCasesState } from '../../domain';
import { LinkedCasesPages } from '../../enums/write-linked-cases-field.enum';

@Component({
  selector: 'ccd-unlink-cases',
  templateUrl: './unlink-cases.component.html'
})
export class UnLinkCasesComponent implements OnInit {

  @Output()
  public linkedCasesStateEmitter: EventEmitter<LinkedCasesState> = new EventEmitter<LinkedCasesState>();

  public errorMessages: ErrorMessage[] = [];

  public ngOnInit(): void {
  }

  public onNext(): void {
    // Return linked cases state and error messages to the parent
    this.linkedCasesStateEmitter.emit({
      currentLinkedCasesPage: LinkedCasesPages.UNLINK_CASE,
      errorMessages: this.errorMessages,
      navigateToNextPage: true
    });
  }
}
