import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChallengedAccessRequest, ErrorMessage } from '../../../domain';
import { CaseNotifier, CasesService } from '../../case-editor';
import { AccessReason, ChallengedAccessRequestErrors, ChallengedAccessRequestPageText } from './models';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'ccd-case-challenged-access-request',
  templateUrl: './case-challenged-access-request.component.html'
})
export class CaseChallengedAccessRequestComponent implements OnDestroy, OnInit {

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
  public $roleAssignmentResponseSubscription: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly route: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier
  ) {
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

    // Initiate Challenged Access Request
    if (this.formGroup.valid) {
      // Get the Case Reference (for which access is being requested) from the ActivatedRouteSnapshot data
      const caseId = this.route.snapshot.params.cid;
      const radioSelectedValue = this.formGroup.get(this.radioSelectedControlName).value;
      // Get the index of the selected AccessReason enum value. Can't use Object.values because it's not available in
      // < ES2017!
      const reasonNumber = Object.keys(AccessReason).map(e => AccessReason[e]).indexOf(radioSelectedValue);
      const challengedAccessRequest = {
        reason: reasonNumber,
        caseReference: reasonNumber === 0 ? this.formGroup.get(this.caseReferenceControlName).value : null,
        otherReason: reasonNumber === 3 ? this.formGroup.get(this.otherReasonControlName).value : null
      } as ChallengedAccessRequest;

      this.$roleAssignmentResponseSubscription = this.casesService.createChallengedAccessRequest(caseId, challengedAccessRequest)
        .pipe(switchMap(() => this.caseNotifier.fetchAndRefresh(caseId)))
        .subscribe(
          _response => {
            // Would have been nice to pass the caseId within state.data, but this isn't part of NavigationExtras until
            // Angular 7.2!
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
}

export interface DisplayedAccessReason {
  reason: AccessReason,
  checked: boolean
}
