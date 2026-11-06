/**
 * Cloned from rpx-xui-webapp src/app/components/error-message/error-message.component.ts
 */
import { DOCUMENT } from '@angular/common';
import { Component, Inject, Input } from '@angular/core';

import { ErrorMessage } from '../../domain';

@Component({
  selector: 'exui-error-message',
  templateUrl: './error-message.component.html',
  standalone: false
})
export class ErrorMessageComponent {
  @Input() public error: ErrorMessage;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  public focusErrorField(event: Event): void {
    // Fragment-only links resolve against the app's base URL, which can leave the current form.
    event.preventDefault();
    const field = this.document.getElementById(this.error.fieldId);
    if (field) {
      field.focus({ preventScroll: true });
      field.scrollIntoView({ block: 'center' });
    }
  }
}
