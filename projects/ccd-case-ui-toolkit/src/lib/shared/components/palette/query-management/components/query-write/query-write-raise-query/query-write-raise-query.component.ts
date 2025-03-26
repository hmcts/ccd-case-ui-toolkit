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

  public raiseQueryErrorMessage = RaiseQueryErrorMessage;

  onSubjectInput(): void {
    const control = this.formGroup.get('subject');
    const value = control?.value;
    if (value && value.length > 200) {
      control?.setValue(value.substring(0, 200));
    }
  }

  getSubjectErrorMessage(): string {
    const control = this.formGroup.get('subject');
    if (control.hasError('required')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT;
    }
    if (control.hasError('maxlength')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT_MAX_LENGTH;
    }
    return '';
  }
}
