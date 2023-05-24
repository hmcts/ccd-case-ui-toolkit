import { Component, Input } from '@angular/core';
import { QueryManagementErrorMessage } from './query-management-error-message.model';

@Component({
  selector: 'ccd-query-management-error-messages',
  templateUrl: './query-management-error-messages.component.html',
  styleUrls: ['./query-management-error-messages.component.scss']
})
export class QueryManagementErrorMessagesComponent {
  @Input() public errorMessages: QueryManagementErrorMessage[] = [];
}
