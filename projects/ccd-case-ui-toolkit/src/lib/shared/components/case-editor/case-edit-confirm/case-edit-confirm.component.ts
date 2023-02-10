import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseEditDataService } from '../../../commons/case-edit-data';

import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition/case-field.model';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Confirmation } from '../domain/confirmation.model';

@Component({
  templateUrl: './case-edit-confirm.html',
  styleUrls: ['../case-edit.scss']
})
export class CaseEditConfirmComponent {
  public eventTrigger: CaseEventTrigger;
  public triggerText = 'Close and Return to case details';
  public formGroup = new FormControl();
  public confirmation: Confirmation;
  public caseFields: CaseField[];
  public editForm: FormGroup;

  constructor(private readonly caseEdit: CaseEditComponent, private readonly caseEditDataService: CaseEditDataService, private readonly router: Router) {
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.caseFields = this.getCaseFields();
    this.caseEditDataService.caseEditState$
      .subscribe(({confirmation}) => {
        if (confirmation) {
          this.confirmation = confirmation;
        } else {
          this.router.navigate(['/']);
        }
      });
  }

  public submit(): void {
    this.caseEdit.submitted.emit({caseId: this.confirmation.getCaseId(), status: this.confirmation.getStatus()});
  }

  public getCaseId(): string {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }

  public getCaseTitle(): string {
    return (this.caseEdit.caseDetails && this.caseEdit.caseDetails.state &&
      this.caseEdit.caseDetails.state.title_display ? this.caseEdit.caseDetails.state.title_display : '');
  }

  private getCaseFields(): CaseField[] {
    if (this.caseEdit.caseDetails) {
      return FieldsUtils.getCaseFields(this.caseEdit.caseDetails);
    }

    return this.eventTrigger.case_fields;
  }
}
