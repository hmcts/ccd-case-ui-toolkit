import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseView, ErrorMessage, ReviewSpecificAccessRequest } from '../../../domain';
import { AccessReason, ReviewSpecificAccessRequestErrors, ReviewSpecificAccessRequestPageText } from './models';

@Component({
  selector: 'ccd-case-review-specific-access-request',
  templateUrl: './case-review-specific-access-request.component.html',
  styleUrls: ['./case-review-specific-access-request.component.scss']
})
export class CaseReviewSpecificAccessRequestComponent
  implements OnInit, OnDestroy {
  public static CANCEL_LINK_DESTINATION = '/work/my-work/list';
  public collapsed = false;
  public title: string;
  public hint: string;
  public caseRefLabel: string;
  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  public readonly accessReasons: DisplayedAccessReason[];
  public requestAccessDetails: RequestAccessDetails;
  public caseSubscription: Subscription;
  public userAccessType: string;
  public caseDetails: CaseView;

  private readonly genericError = 'There is a problem';
  private readonly radioSelectedControlName = 'radioSelected';

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly appConfig: AbstractAppConfig,
  ) {
    this.accessReasons = [
      { reason: AccessReason.APPROVE_REQUEST, checked: false },
      { reason: AccessReason.REJECT_REQUEST, checked: false },
      { reason: AccessReason.REQUEST_MORE_INFORMATION, checked: false },
    ];
  }

  public ngOnInit(): void {
    // TODO: this ticket is blocked so mocked with those data to go through, they will be removed and implimented with actual data
    // when dependency resolved
    this.setMockData();
    this.title = ReviewSpecificAccessRequestPageText.TITLE;
    this.hint = ReviewSpecificAccessRequestPageText.HINT;
    this.caseRefLabel = ReviewSpecificAccessRequestPageText.CASE_REF;
    this.formGroup = this.fb.group({
      radioSelected: new FormControl(null, Validators.required),
    });
  }

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public onChange(): void {
    this.submitted = false;
  }

  public onSubmit(): void {
    this.submitted = true;

    if (this.formGroup.get(this.radioSelectedControlName).invalid) {
      this.errorMessage = {
        title: this.genericError,
        description: ReviewSpecificAccessRequestErrors.NO_SELECTION,
      };
    }
    // Initiate Review Access Request
    if (this.formGroup.valid) {
      // Get the Case Reference (for which access is being requested) from the ActivatedRouteSnapshot data
      const caseId = this.route.snapshot.data.case.case_id;
      const radioSelectedValue = this.formGroup.get(
        this.radioSelectedControlName
      ).value;
      // Get the index of the selected AccessReason enum value. Can't use Object.values because it's not available in
      // < ES2017!
      const reasonNumber = Object.keys(AccessReason)
        .map((e) => AccessReason[e])
        .indexOf(radioSelectedValue);
      // request model created , it will be used for submission part
      const challengedAccessRequest = {
        reason: reasonNumber,
        caseId,
      } as ReviewSpecificAccessRequest;
      if ( AccessReason.REJECT_REQUEST === radioSelectedValue ) {
        this.router.navigate(['rejected'], {relativeTo: this.route});
      }
    }
  }

  public onCancel(): void {
    this.router.navigateByUrl(CaseReviewSpecificAccessRequestComponent.CANCEL_LINK_DESTINATION);
  }

  // remove once Access management goes live
  public setMockData(): void {
    const requestAccessDetailsMock =
      this.appConfig.getAccessManagementRequestReviewMockModel();

    if (requestAccessDetailsMock.active) {
      this.requestAccessDetails = requestAccessDetailsMock.details;
    }
  }
}

export interface DisplayedAccessReason {
  reason: AccessReason;
  checked: boolean;
}

export interface RequestAccessDetails {
  caseName: string;
  caseReference: string;
  dateSubmitted: string;
  requestFrom: string;
  reasonForCaseAccess: string;
}
