import { Component, Input, ChangeDetectionStrategy } from '@angular/core';


@Component({
  selector: 'ccd-session-error-page',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './session-error-page.component.html'
})
export class SessionErrorPageComponent {
  @Input() public title: string = 'There is a problem with your session';
  @Input() public primaryMessage: string = 'Go to landing page. Refreshing the page. If the problem persists, sign out and sign in again.';
  @Input() public secondaryMessage: string = 'If you still cannot access the service, clear your browser data for this website.';
}
