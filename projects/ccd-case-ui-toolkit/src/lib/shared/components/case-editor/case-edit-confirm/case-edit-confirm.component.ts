import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { CaseField } from '../../../domain/definition';
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

  private readonly caseId: string;

  constructor(private readonly caseEdit: CaseEditComponent, private readonly router: Router) {
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
