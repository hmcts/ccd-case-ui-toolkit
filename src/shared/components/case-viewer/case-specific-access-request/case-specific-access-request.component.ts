import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorMessage, SpecificAccessRequest } from '../../../domain';
import { CasesService } from '../../case-editor';
import {
  SpecificAccessRequestErrors,
  SpecificAccessRequestPageText
} from './models';

@Component({
  selector: 'ccd-case-specific-access-request',
  templateUrl: './case-specific-access-request.component.html',
})
export class CaseSpecificAccessRequestComponent implements OnDestroy, OnInit {
  public collapsed = false;
  public title: string;
  public hint: string;
  public caseRefLabel: string;
  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  public $roleAssignmentResponseSubscription: Subscription;

  private readonly genericError = 'There is a problem';
  private readonly specificReasonControlName = 'specificReason';

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly route: ActivatedRoute
  ) {}

  public ngOnInit(): void {
    this.title = SpecificAccessRequestPageText.TITLE;
    this.hint = SpecificAccessRequestPageText.HINT;
    this.caseRefLabel = SpecificAccessRequestPageText.CASE_REF;
    this.formGroup = this.fb.group({
      radioSelected: new FormControl(null, null),
    });

    this.formGroup.addControl(
      this.specificReasonControlName,
      new FormControl('', {
        validators: [
          (control: AbstractControl): { [key: string]: boolean } | null => {
            if (this.inputEmpty(control)) {
              return { invalid: true };
            }
            return null;
          },
        ],
        updateOn: 'submit',
      })
    );
  }

  public onChange(): void {
    this.submitted = false;
    // Clear the "specific reason" fields manually. This prevents any previous value being retained by
    // the field's FormControl when the field itself is removed from the DOM by *ngIf. (If it is subsequently added back
    // to the DOM by *ngIf, it will appear empty but the associated FormControl still has the previous value.)
    this.formGroup.get(this.specificReasonControlName).setValue('');
  }

  public onSubmit(): void {
    this.submitted = true;
    if (this.formGroup.get(this.specificReasonControlName).invalid) {
      this.errorMessage = {
        title: this.genericError,
        description: SpecificAccessRequestErrors.NO_REASON,
        fieldId: 'specific-reason',
      };
    }

    // Initiate Specific Access Request
    if (this.formGroup.valid) {
      // Get the Case Reference (for which access is being requested) from the ActivatedRouteSnapshot data
      const caseId = this.route.snapshot.data.case.case_id;
      const specificAccessRequest = {
        specificReason: this.formGroup.get(this.specificReasonControlName).value
      } as SpecificAccessRequest;

      this.$roleAssignmentResponseSubscription = this.casesService.createSpecificAccessRequest(caseId, specificAccessRequest)
        .subscribe(
          _response => {
            // Would have been nice to pass the caseId within state.data, but this isn't part of NavigationExtras until
            // Angular 7.2
            this.router.navigate(['success'], {relativeTo: this.route});
          },
          _error => {
            // Navigate to error page
          }
        );
    }
  }

  public onCancel(): void {
    // Navigate to the page before previous one (should be Search Results or Case List page, for example)
    window.history.go(-2);
  }

  public ngOnDestroy(): void {
    if (this.$roleAssignmentResponseSubscription) {
      this.$roleAssignmentResponseSubscription.unsubscribe();
    }
  }

  private inputEmpty(input: AbstractControl): boolean {
    return input.value == null || input.value.trim().length === 0;
  }
}
