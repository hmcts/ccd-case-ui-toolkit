import { Component, Input, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { AbstractAppConfig } from '../../../app.config';
import { CaseView } from '../../domain';
import { CaseNotifier } from '../case-editor';

@Component({
  selector: 'ccd-case-viewer',
  templateUrl: './case-viewer.component.html'
})
export class CaseViewerComponent implements OnInit, OnDestroy {

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;

  @Input() public caseDetails: CaseView;
  public caseSubscription: Subscription;

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
  }

  ngOnDestroy() {
    if (!!this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public isDataLoaded(): boolean {
    return !!this.caseDetails;
  }

  public hasAccess(): boolean {
    const featureToggleOn = this.appConfig.getAccessManagementMode();
    const userPermissionType = false; // should come from metadatafields
    return featureToggleOn ? userPermissionType : true;
  }

}
