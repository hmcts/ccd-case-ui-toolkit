import { Component, Input } from '@angular/core';
import { QueryCreateContext } from '../../models/query-create-context.enum';

@Component({
  selector: 'ccd-query-confirmation',
  templateUrl: './query-confirmation.component.html'
})
export class QueryConfirmationComponent {
  @Input() public queryCreateContext: QueryCreateContext;

  public caseId = '';
  public queryCreateContextEnum = QueryCreateContext;
}
