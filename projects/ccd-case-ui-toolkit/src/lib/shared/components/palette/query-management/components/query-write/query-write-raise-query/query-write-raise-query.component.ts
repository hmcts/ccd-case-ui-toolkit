import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RaiseQueryErrorMessage } from '../../../enums';
@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html'
})
export class QueryWriteRaiseQueryComponent {
  @Input() public formGroup: FormGroup;
  @Input() public submitted: boolean;
  @Input() public caseDetails;
  @Input() public showForm: boolean;
  @Input() public serviceMessage: string | null;

  public raiseQueryErrorMessage = RaiseQueryErrorMessage;
}
