import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CaseView } from '../../../domain/case-view/case-view.model';
import { CaseReferencePipe } from '../../../pipes';
import { CasesService } from '../../case-editor/services/cases.service';

@Component({
  selector: 'ccd-case-basic-access-view',
  templateUrl: 'case-basic-access-view.component.html',
  providers: [CaseReferencePipe]
})
export class CaseBasicAccessViewComponent implements OnInit, OnDestroy {
  public static CANCEL_LINK_DESTINATION = '/work/my-work/list';

  @Input()
  public caseDetails: CaseView = null;

  @Input()
  public accessType: string = null;

  public courtOrHearingCentre: string = null;
  public showSpinner: boolean;
  private courtOrHearingCentreSubscription: Subscription;

  constructor(
    private readonly casesService: CasesService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly caseReferencePipe: CaseReferencePipe
  ) {}

  public ngOnInit(): void {
    const caseName: string = this.caseDetails.basicFields?.caseNameHmctsInternal;

    if (caseName) {
      this.titleService.setTitle(`${caseName} (${this.caseReferencePipe.transform(this.caseDetails.case_id)}) - HM Courts & Tribunals Service - GOV.UK`);
    } else {
      this.titleService.setTitle(`${this.caseReferencePipe.transform(this.caseDetails.case_id)} - HM Courts & Tribunals Service - GOV.UK`);
    }

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
    this.router.navigateByUrl(CaseBasicAccessViewComponent.CANCEL_LINK_DESTINATION);
  }

  public getRequestUrl(accessType: string): string {
    return accessType === 'CHALLENGED' ? 'challenged-access-request' : 'specific-access-request';
  }
}
