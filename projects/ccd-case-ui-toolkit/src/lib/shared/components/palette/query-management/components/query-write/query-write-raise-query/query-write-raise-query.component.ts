import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from '../../../../../../domain';
import { RaiseQueryErrorMessage } from '../../../enums';

@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html',
  styleUrls: ['./query-write-raise-query.component.scss']
})
export class QueryWriteRaiseQueryComponent implements OnInit {
  @Input() public formGroup: FormGroup;

  public errorMessages: ErrorMessage[] = [];
  public raiseQueryErrorMessage = RaiseQueryErrorMessage;
  public queryFullNameError: string;
  public querySubjectError: string;
  public queryBodyError: string;

  public ngOnInit(): void {
    this.formGroup = new FormGroup({
      fullName: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required),
      body: new FormControl('', Validators.required),
      isHearingRelated: new FormControl(null, Validators.required),
      documents: new FormControl([], Validators.required)
    });
  }

  public onNext(): void {
    this.validateForm();
  }

  public validateForm(): void {
    this.errorMessages = [];
    this.queryFullNameError = '';
    this.querySubjectError = '';
    this.queryBodyError = '';
    if (!this.formGroup.get('fullName').valid) {
      this.queryFullNameError = RaiseQueryErrorMessage.FULL_NAME;
      this.errorMessages.push({
        title: '',
        description: RaiseQueryErrorMessage.FULL_NAME,
        fieldId: 'query-raise-fullName'
      });
    }
    if (!this.formGroup.get('subject').valid) {
      this.querySubjectError = RaiseQueryErrorMessage.QUERY_SUBJECT;
      this.errorMessages.push({
        title: '',
        description: RaiseQueryErrorMessage.QUERY_SUBJECT,
        fieldId: 'query-raise-subject'
      });
    }
    if (!this.formGroup.get('body').valid) {
      this.queryBodyError = RaiseQueryErrorMessage.QUERY_BODY;
      this.errorMessages.push({
        title: '',
        description: RaiseQueryErrorMessage.QUERY_BODY,
        fieldId: 'query-raise-body'
      });
    }
    window.scrollTo(0, 0);
  }

  public navigateToErrorElement(elementId: string): void {
    if (elementId) {
      const htmlElement = document.getElementById(elementId);
      if (htmlElement) {
        htmlElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        htmlElement.focus();
      }
    }
  }
}
