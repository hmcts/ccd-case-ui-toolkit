import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CasesService } from '../..';
import { CaseView } from '../../../domain';

@Component({
  selector: 'ccd-case-basic-access-view',
  templateUrl: 'case-basic-access-view.component.html'
})
export class CaseBasicAccessViewComponent implements OnInit, OnDestroy {

  @Input()
  public caseDetails: CaseView = null;

  @Input()
  public accessType: string = null;

  public courtOrHearingCentre: string = null;
  public showSpinner: boolean;
  private courtOrHearingCentreSubscription: Subscription;

  constructor(
    private readonly casesService: CasesService
  ) {}

  public ngOnInit(): void {
    const locationId = this.caseDetails &&
                        this.caseDetails.basicFields &&
                        this.caseDetails.basicFields.caseManagementLocation &&
                        this.caseDetails.basicFields.caseManagementLocation.baseLocation ?
      this.caseDetails.basicFields.caseManagementLocation.baseLocation : null;

    if (locationId) {
      this.showSpinner = true;
      this.courtOrHearingCentreSubscription = this.casesService.getCourtOrHearingCentreName(locationId).subscribe(courtOrHearingCentre => {
        this.courtOrHearingCentre = courtOrHearingCentre[0] && courtOrHearingCentre[0].court_name ?
        courtOrHearingCentre[0].court_name : null;
        this.showSpinner = false;
      },
      error => this.showSpinner = false);
    }
  }

  public ngOnDestroy(): void {
    if (this.courtOrHearingCentreSubscription) {
      this.courtOrHearingCentreSubscription.unsubscribe();
    }
  }

  public onCancel(): void {
    // Navigate to the previous page
    window.history.go(-1);
  }

  public getRequestUrl(accessType: string): string {
    return accessType === 'CHALLENGED' ? 'challenged-access-request' : 'specific-access-request';
  }
}
