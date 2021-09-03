import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AbstractAppConfig } from '../../../app.config';
import { CaseTab, CaseView } from '../../domain';
import { CaseNotifier } from '../case-editor';

@Component({
  selector: 'ccd-case-viewer',
  templateUrl: './case-viewer.component.html'
})
export class CaseViewerComponent implements OnInit, OnDestroy {

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;

  @Input() public prependedTabs: CaseTab[] = [];
  @Input() public caseDetails: CaseView;
  public caseSubscription: Subscription;
  public userAccessType: string | number;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier,
    private readonly appConfig: AbstractAppConfig,
  ) {
  }

  ngOnInit() {
    console.log(this.caseDetails);
    if (!this.route.snapshot.data.case) {
      this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
        this.caseDetails = caseDetails;
      });
    } else {
      this.caseDetails = this.route.snapshot.data.case;
    }
    // Replace later with:
    // this.caseDetails.metadataFields.find(metadataField => metadataField.id === '[ACCESS_PROCESS]').value
    this.userAccessType = 'CHALLENGED';
  }

  ngOnDestroy() {
    if (!!this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public isDataLoaded(): boolean {
    return !!this.caseDetails;
  }

  public hasStandardAccess(): boolean {
    const featureToggleOn = this.appConfig.getAccessManagementMode();
    return featureToggleOn ? this.userAccessType !== 'CHALLENGED' && this.userAccessType !== 'SPECIFIC' : true;
  }

}
