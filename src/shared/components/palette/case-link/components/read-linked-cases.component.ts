import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CaseField } from '../../../../domain';

@Component({
  selector: 'ccd-read-linked-cases',
  templateUrl: './read-linked-cases.component.html'
})
export class ReadLinkedCasesComponent {

  @Input()
  caseField: CaseField;

  reload = false
  public serverError: { id: string, message: string } = null;

  constructor(private router: Router) {}

  reloadCurrentRoute() {
    const currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
        this.router.navigate([currentUrl], {
      queryParams: {refresh: new Date().getTime()}
   });
  }

  getFailureNotification(evt) {
    const errorMessage = 'There has been a system error and your request could not be processed.';
    this.serverError = {
      id: 'backendError', message: errorMessage
    };
  }
}
