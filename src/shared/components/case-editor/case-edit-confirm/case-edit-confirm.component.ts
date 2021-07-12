import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Router } from '@angular/router';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Confirmation } from '../domain/confirmation.model';
import { CaseField } from '../../../domain/definition';
import { FieldsUtils } from '../../../services/fields/fields.utils';
import { FormGroup } from '@angular/forms';

@Component({
  templateUrl: './case-edit-confirm.html',
  styleUrls: ['../case-edit.scss']
})
export class CaseEditConfirmComponent {

  private caseId: string;
  eventTrigger: CaseEventTrigger;
  triggerText = 'Close and Return to case details';
  formGroup = new FormControl();
  confirmation: Confirmation;
  caseFields: CaseField[];
  editForm: FormGroup;

  constructor(private caseEdit: CaseEditComponent, private router: Router) {
    this.eventTrigger = this.caseEdit.eventTrigger;
    this.editForm = this.caseEdit.form;
    this.caseFields = this.getCaseFields();
    if (this.caseEdit.confirmation) {
      this.confirmation = this.caseEdit.confirmation;
      this.caseId = this.caseEdit.confirmation.getCaseId();
    } else {
      this.router.navigate(['/']);
    }
  }

  submit(): void {
    this.caseEdit.submitted.emit({caseId: this.confirmation.getCaseId(), status: this.confirmation.getStatus()});
  }

  getCaseId(): string {
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
