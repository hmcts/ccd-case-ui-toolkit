import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ccd-session-error-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-error-page.component.html'
})
export class SessionErrorPageComponent {
  @Input() public title: string = 'There is a problem with your session';
  @Input() public primaryMessage: string = 'Go to landing page. Refreshing the page. If the problem persists, sign out and sign in again.';
  @Input() public secondaryMessage: string = 'If you still cannot access the service, clear your browser data for this website.';
}
