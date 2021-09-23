import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from '../../../domain';
import { AccessReason, ChallengedAccessRequestErrors, ChallengedAccessRequestPageText } from './models';

@Component({
  selector: 'ccd-case-challenged-access-request',
  templateUrl: './case-challenged-access-request.component.html'
})
export class CaseChallengedAccessRequestComponent implements OnInit {

  public title: string;
  public hint: string;
  public caseRefLabel: string;
  public readonly accessReasons: DisplayedAccessReason[];
  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  private readonly genericError = 'There is a problem';
  private readonly radioSelectedControlName = 'radioSelected';
  private readonly caseReferenceControlName = 'caseReference';
  private readonly otherReasonControlName = 'otherReason';

  constructor(private readonly fb: FormBuilder) {
    this.accessReasons = [
      {reason: AccessReason.LINKED_TO_CURRENT_CASE, checked: false},
      {reason: AccessReason.CONSOLIDATE_CASE, checked: false},
      {reason: AccessReason.ORDER_FOR_TRANSFER, checked: false},
      {reason: AccessReason.OTHER, checked: false}
    ];
  }

  public ngOnInit(): void {
    this.title = ChallengedAccessRequestPageText.TITLE;
    this.hint = ChallengedAccessRequestPageText.HINT;
    this.caseRefLabel = ChallengedAccessRequestPageText.CASE_REF;
    this.formGroup = this.fb.group({
      radioSelected: new FormControl(null, Validators.required)
    });
    this.formGroup.addControl(this.caseReferenceControlName,
      new FormControl('', {
        validators: [(control: AbstractControl): {[key: string]: boolean} | null => {
          if (this.formGroup.get(this.radioSelectedControlName).value === AccessReason.LINKED_TO_CURRENT_CASE && this.inputEmpty(control)) {
            return {'invalid': true};
          }
          return null;
        }],
        updateOn: 'submit'
      })
    );
    this.formGroup.addControl(this.otherReasonControlName,
      new FormControl('', {
        validators: [(control: AbstractControl): {[key: string]: boolean} | null => {
          if (this.formGroup.get(this.radioSelectedControlName).value === AccessReason.OTHER && this.inputEmpty(control)) {
            return {'invalid': true};
          }
          return null;
        }],
        updateOn: 'submit'
      })
    );
  }

  private inputEmpty(input: AbstractControl): boolean {
    return input.value == null || input.value.trim().length === 0;
  }

  public onChange(): void {
    this.submitted = false;
    // Clear the "Case reference" and "Other reason" fields manually. This prevents any previous value being retained by
    // the field's FormControl when the field itself is removed from the DOM by *ngIf. (If it is subsequently added back
    // to the DOM by *ngIf, it will appear empty but the associated FormControl still has the previous value.)
    this.formGroup.get(this.caseReferenceControlName).setValue('');
    this.formGroup.get(this.otherReasonControlName).setValue('');
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formGroup.get(this.radioSelectedControlName).invalid) {
      this.errorMessage = {
        title: this.genericError,
        description: ChallengedAccessRequestErrors.NO_SELECTION
      };
    } else {
      if (this.formGroup.get(this.caseReferenceControlName).invalid) {
        this.errorMessage = {
          title: this.genericError,
          description: ChallengedAccessRequestErrors.NO_CASE_REFERENCE,
          fieldId: 'case-reference'
        };
      }

      if (this.formGroup.get(this.otherReasonControlName).invalid) {
        this.errorMessage = {
          title: this.genericError,
          description: ChallengedAccessRequestErrors.NO_REASON,
          fieldId: 'other-reason'
        };
      }
    }
  }

  public onCancel(): void {
    // Navigate to the previous page
    window.history.go(-1);
  }
}

export interface DisplayedAccessReason {
  reason: AccessReason,
  checked: boolean
}
