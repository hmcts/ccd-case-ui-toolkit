import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { CaseEditComponent } from '../case-edit/case-edit.component';
import { Router } from '@angular/router';
import { CaseEventTrigger } from '../../../domain/case-view/case-event-trigger.model';
import { Confirmation } from '../domain/confirmation.model';

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

  constructor(private caseEdit: CaseEditComponent, private router: Router) {
    this.eventTrigger = this.caseEdit.eventTrigger;
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

  getCaseId(): String {
    return (this.caseEdit.caseDetails ? this.caseEdit.caseDetails.case_id : '');
  }
}
