import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'ccd-read-linked-cases',
  templateUrl: './read-linked-cases.component.html'
})
export class ReadLinkedCasesComponent {
  
  public serverError: { id: string, message: string } = null;

  getFailureNotification(evt) {
    const errorMessage = "There was a system error and your request could not be processed. Reload the Linked cases tab."
    this.serverError = {
      id: 'backendError', message: errorMessage
    };
  }
}
