import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ErrorMessage } from '../../../domain';
import { CaseEditPageComponent } from '../../case-editor/case-edit-page/case-edit-page.component';
import { AbstractFieldWriteComponent } from '../base-field';
import { LinkedCasesState } from './domain';
import { LinkedCasesPages } from './enums';

@Component({
  selector: 'ccd-write-linked-cases-field',
  templateUrl: './write-linked-cases-field.component.html'
})
export class WriteLinkedCasesFieldComponent extends AbstractFieldWriteComponent implements OnInit {
  
  @Input()
  public caseEditPageComponent: CaseEditPageComponent;

  public formGroup: FormGroup;
  public linkedCasesPage: number;
  public linkedCasesPages = LinkedCasesPages;
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
  }

  public onLinkedCasesStateEmitted(linkedCasesState: LinkedCasesState): void {
    // Clear validation errors from the parent CaseEditPageComponent
    // (given the "Next" button in a child component has been clicked)
    this.caseEditPageComponent.validationErrors = [];
    this.errorMessages = linkedCasesState.errorMessages;
    if (!this.errorMessages) {
      this.proceedToNextState();
    }
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
    return this.linkedCasesPage === this.linkedCasesPages.CHECK_YOUR_ANSWERS;
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
