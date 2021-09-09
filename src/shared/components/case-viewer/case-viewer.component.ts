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

  static readonly METADATA_FIELD_ACCESS_PROCEES_ID = '[ACCESS_PROCESS]';
  static readonly NON_STANDARD_USER_ACCESS_TYPES = ['CHALLENGED', 'SPECIFIC'];

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;

  @Input() public prependedTabs: CaseTab[] = [];
  @Input() public caseDetails: CaseView;
  public caseSubscription: Subscription;
  public userAccessType: string;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier,
    private readonly appConfig: AbstractAppConfig,
  ) {
  }

  public ngOnInit(): void {
    this.loadCaseDetails();
  }

  public ngOnDestroy(): void {
    if (!!this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public loadCaseDetails(): void {
    if (!this.route.snapshot.data.case) {
      this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
        this.caseDetails = caseDetails;
        this.setUserAccessType(this.caseDetails);
      });
    } else {
      this.caseDetails = this.route.snapshot.data.case;
      this.setUserAccessType(this.caseDetails);
    }
  }

  public setUserAccessType(caseDetails: CaseView): void {
    if (caseDetails && Array.isArray(caseDetails.metadataFields)) {
      const access_process = caseDetails.metadataFields.find(metadataField => metadataField.id === CaseViewerComponent.METADATA_FIELD_ACCESS_PROCEES_ID);
      this.userAccessType = access_process ? access_process.value : null;
    }
  }

  public isDataLoaded(): boolean {
    return !!this.caseDetails;
  }

  public hasStandardAccess(): boolean {
    const featureToggleOn = this.appConfig.getAccessManagementMode();
    return featureToggleOn ? CaseViewerComponent.NON_STANDARD_USER_ACCESS_TYPES.indexOf(this.userAccessType) === -1 : true;
  }

}
