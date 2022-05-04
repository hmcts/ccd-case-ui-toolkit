import { Component, OnInit } from '@angular/core';
import { ErrorMessage } from '../../../domain';
import { AbstractFieldWriteComponent } from '../base-field';
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
