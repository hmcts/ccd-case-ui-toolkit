import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ErrorMessage } from '../../../domain';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field';
import { LinkedCasesState } from './domain';
import { LinkedCasesEventTriggers, LinkedCasesPages } from './enums';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html'
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteComponent implements OnInit {

  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  public eventTriggerId: string;
  public formGroup: FormGroup;
  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
  public linkedCasesEventTriggers = LinkedCasesEventTriggers;
  public errorMessages: ErrorMessage[] = [];

  constructor() {
    super();
  }

  public ngOnInit(): void {
    this.formGroup = this.registerControl(new FormGroup({}, {
      validators: (_: AbstractControl): {[key: string]: boolean} | null => {
        if (!this.isAtFinalState()) {
          // Return an error to mark the FormGroup as invalid if not at the final state
          return {notAtFinalState: true};
        }
        return null;
      }
    }), true) as FormGroup;
    // Initialise the first page to display
    this.linkedCasesPage = this.linkedCasesPages.BEFORE_YOU_START;
    this.eventTriggerId = this.caseEditPageComponent.eventTrigger.id;
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    // Clear validation errors from the parent CaseEditPageComponent
    // (given the "Next" button in a child component has been clicked)
    this.caseEditPageComponent.validationErrors = [];
    this.errorMessages = linkedCasesState.errorMessages ? linkedCasesState.errorMessages : [];
    if (this.errorMessages.length === 0) {
      this.proceedToNextState();
    }
  }

  public proceedToNextState(): void {
    this.linkedCasesPage = this.getNextPage();

    // Deliberately not part of an if...else statement with the above because validation needs to be triggered as soon as
    // the form is at the final state
    if (this.isAtFinalState()) {
      // Trigger validation to clear the "notAtFinalState" error if now at the final state
      this.formGroup.updateValueAndValidity();
      this.caseEditPageComponent.next();
    }
  }

  public isAtFinalState(): boolean {
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
  }

  public getNextPage(): number {
    if (this.linkedCasesPage === LinkedCasesPages.BEFORE_YOU_START) {
      return this.eventTriggerId === LinkedCasesEventTriggers.LINK_CASES
        ? LinkedCasesPages.LINK_CASE
        : LinkedCasesPages.UNLINK_CASE;
    }
    return LinkedCasesPages.CHECK_YOUR_ANSWERS;
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
