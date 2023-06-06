import { Component } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AbstractFieldReadComponent } from '../base-field';
import { QueryManagementErrorMessage } from './components/query-management-error-messages/query-management-error-message.model';
import { QueryListItem } from './models';
@Component({
  selector: 'ccd-write-query-management-field',
  templateUrl: './write-query-management-field.component.html',
  styleUrls: ['./write-query-management-field.component.scss']
})
export class WriteQueryManagementFieldComponent extends AbstractFieldReadComponent {
  public queryItem: QueryListItem;
  public responseFormGroup = new FormGroup({
    response: new FormControl('', [Validators.required]),
    documents: new FormControl([])
  });

  public errorMessages: QueryManagementErrorMessage[] = [];
  public submitted = false;

  constructor() {
    super();
  }

  public submitForm(): void {
    this.submitted = true;
    this.errorMessages = [];
    window.scrollTo(0, 0);

    if (!this.responseFormGroup.valid) {
      if (this.responseFormGroup.controls.response.hasError('required')) {
        this.errorMessages.push({ controlName: 'response', message: 'Add a response before continue' });
      }
    }
  }
}
