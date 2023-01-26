/**
 * Cloned from rpx-xui-webapp src/app/components/error-message/error-message.component.ts
 */
import { Component, Input } from '@angular/core';

import { ErrorMessage } from '../../domain';

@Component({
  selector: 'exui-error-message',
  templateUrl: './error-message.component.html'
})
export class ErrorMessageComponent {
  @Input() public error: ErrorMessage;
}
