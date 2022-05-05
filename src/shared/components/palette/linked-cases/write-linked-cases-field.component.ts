import { Component, OnInit } from '@angular/core';
import { ErrorMessage } from '../../../domain';
import { AbstractFieldWriteComponent } from '../base-field';
import { LinkedCasesState } from './domain';
import { LinkedCasesPages } from './enums';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html'
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public errorMessages: ErrorMessage[] = [];

  constructor() {
    super();
  }

  public ngOnInit(): void {
    // Initialise the first page to display
    this.linkedCasesPage = this.linkedCasesPages.BEFORE_YOU_START;
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    this.errorMessages = linkedCasesState.errorMessages;
  }

  public proceedToNextState(): void {
    if (!this.isAtFinalState()) {
      // Set linkedCasesPage based on whether it is link or unlink journey
      // Setting it to link journey at the moment
      this.linkedCasesPage = this.linkedCasesPages.LINK_CASE;
    }
    
    // Deliberately not part of an if...else statement with the above because validation needs to be triggered as soon as
    // the form is at the final state
    if (this.isAtFinalState()) {
      // Trigger validation to clear the "notAtFinalState" error if now at the final state
      this.formGroup.updateValueAndValidity();
    }
  }

  public isAtFinalState(): boolean {
    return false;
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
