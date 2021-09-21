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
  private courtOrHearingCentreSubscription: Subscription;

  constructor(
    private readonly casesService: CasesService
  ) {}

  public ngOnInit(): void {
    const locationId = this.caseDetails.basicFields.caseManagementLocation.baseLocation;
    this.courtOrHearingCentreSubscription = this.casesService.getCourtOrHearingCentreName(locationId).subscribe(courtOrHearingCentre =>
      this.courtOrHearingCentre = courtOrHearingCentre.location
    );
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
}
