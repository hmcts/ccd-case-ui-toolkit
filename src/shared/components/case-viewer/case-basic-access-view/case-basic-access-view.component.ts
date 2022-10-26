import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CasesService } from '../..';
import { CaseView } from '../../../domain';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

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
  private courtOrHearingCentreSubscription: Subscription;

  constructor(
    private readonly casesService: CasesService,
    private readonly router: Router,
    private readonly _location: Location
  ) {}

  public ngOnInit(): void {
    const locationId = this.caseDetails &&
                        this.caseDetails.basicFields &&
                        this.caseDetails.basicFields.caseManagementLocation &&
                        this.caseDetails.basicFields.caseManagementLocation.baseLocation ?
      this.caseDetails.basicFields.caseManagementLocation.baseLocation : null;

    if (locationId) {
      this.courtOrHearingCentreSubscription = this.casesService.getCourtOrHearingCentreName(locationId).subscribe(courtOrHearingCentre =>
        this.courtOrHearingCentre = courtOrHearingCentre[0] && courtOrHearingCentre[0].building_location_name ?
                                    courtOrHearingCentre[0].building_location_name :
                                    null
      );
    }
  }

  public ngOnDestroy(): void {
    if (this.courtOrHearingCentreSubscription) {
      this.courtOrHearingCentreSubscription.unsubscribe();
    }
  }

  public onCancel(): void {
    // TODO: hacky solution to refresh case component (i.e. visit another route and then visit the previous one;
    //  we use skipLocationChange so we don't make an useless entry to the browser's history)
    this.router.navigateByUrl(`/cases/case-loader`, { skipLocationChange: true }).then(() => {
      this._location.back();
    });
  }

  public getRequestUrl(accessType: string): string {
    return accessType === 'CHALLENGED' ? 'challenged-access-request' : 'specific-access-request';
  }
}
