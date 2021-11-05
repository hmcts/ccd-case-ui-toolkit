import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { ErrorMessage, ReviewSpecificAccessRequest } from "../../../domain";
import {
  AccessReason,
  ReviewSpecificAccessRequestErrors,
  ReviewSpecificAccessRequestPageText,
} from "./models";

@Component({
  selector: "ccd-case-review-specific-access-request",
  templateUrl: "./case-review-specific-access-request.component.html",
})
export class CaseReviewSpecificAccessRequestComponent implements OnInit {
  public collapsed = false;
  public title: string;
  public hint: string;
  public caseRefLabel: string;
  public formGroup: FormGroup;
  public submitted = false;
  public errorMessage: ErrorMessage;
  private readonly genericError = "There is a problem";
  private readonly radioSelectedControlName = "radioSelected";
  public readonly accessReasons: DisplayedAccessReason[];
  public $roleAssignmentResponseSubscription: Subscription;
  public  requestAccessDetails :RequestAccessDetails;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.accessReasons = [
      { reason: AccessReason.APPROVE_REQUEST, checked: false },
      { reason: AccessReason.REJECT_REQUEST, checked: false },
      { reason: AccessReason.REQUEST_MORE_INFORMATION, checked: false },
    ];
  }

  public ngOnInit(): void {
    //|TODO: this ticket is blocked so mocked with those data to go through, they will be removed and implimented with actual data
    //when dependency resolved
    this.requestAccessDetails = { 
      caseName: 'Amelia Chu',
      caseReference: 'PA/00467/2017',
      dateSubmitted: '2 November 2021',
      requestFrom: 'Judge Randel-Combeswardly',
      reasonForCaseAccess: 'To view details of the other case linked to the parties/family on my current case.'
    }
    this.title = ReviewSpecificAccessRequestPageText.TITLE;
    this.hint = ReviewSpecificAccessRequestPageText.HINT;
    this.caseRefLabel = ReviewSpecificAccessRequestPageText.CASE_REF;

    this.formGroup = this.fb.group({
      radioSelected: new FormControl(null, Validators.required),
    });
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

    // Initiate Challenged Access Request
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
        caseId: caseId,
      } as ReviewSpecificAccessRequest;
    }
  }

  public onCancel(): void {
    // Navigate to the page before previous one (should be Search Results or Case List page, for example)
    window.history.go(-1);
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
