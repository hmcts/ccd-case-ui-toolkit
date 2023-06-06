import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { CaseTab, CaseView } from '../../domain';
import { CaseNotifier } from '../case-editor';
import { OrderService } from '../../services';

@Component({
  selector: 'ccd-case-viewer',
  templateUrl: './case-viewer.component.html'
})
export class CaseViewerComponent implements OnInit, OnDestroy {
  public static readonly METADATA_FIELD_ACCESS_PROCESS_ID = '[ACCESS_PROCESS]';
  public static readonly METADATA_FIELD_ACCESS_GRANTED_ID = '[ACCESS_GRANTED]';
  public static readonly NON_STANDARD_USER_ACCESS_TYPES = ['CHALLENGED', 'SPECIFIC'];
  public static readonly BASIC_USER_ACCESS_TYPES = 'BASIC';

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;
  @Input() public prependedTabs: CaseTab[] = [];
  @Input() public appendedTabs: CaseTab[] = [];

  public caseDetails: CaseView;
  public caseSubscription: Subscription;
  public userAccessType: string;
  public accessGranted: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier,
    private readonly appConfig: AbstractAppConfig,
    private readonly orderService: OrderService
  ) {}

  public ngOnInit(): void {
    this.loadCaseDetails();
  }

  public ngOnDestroy(): void {
    if (this.caseSubscription) {
      this.caseSubscription.unsubscribe();
    }
  }

  public loadCaseDetails(): void {
    if (this.route.snapshot.data.case) {
      this.caseDetails = this.route.snapshot.data.case;
      this.caseDetails.tabs = this.orderService.sort(this.caseDetails.tabs);
      this.caseDetails.tabs = this.suffixDuplicateTabs(this.caseDetails.tabs);
      this.setUserAccessType(this.caseDetails);
    } else {
      this.caseSubscription = this.caseNotifier.caseView.subscribe(caseDetails => {
        this.caseDetails = caseDetails;
        this.setUserAccessType(this.caseDetails);
      });
    }
  }

  public setUserAccessType(caseDetails: CaseView): void {
    if (caseDetails && Array.isArray(caseDetails.metadataFields)) {
      const accessProcess = caseDetails.metadataFields.find(metadataField =>
        metadataField.id === CaseViewerComponent.METADATA_FIELD_ACCESS_PROCESS_ID);
      const accessGranted = caseDetails.metadataFields.find(metadataField =>
        metadataField.id === CaseViewerComponent.METADATA_FIELD_ACCESS_GRANTED_ID);
        this.accessGranted = accessGranted ? accessGranted.value !== CaseViewerComponent.BASIC_USER_ACCESS_TYPES : false;
      this.userAccessType = accessProcess ? accessProcess.value : null;
    }
  }

  public isDataLoaded(): boolean {
    return !!this.caseDetails;
  }

  public hasStandardAccess(): boolean {
    const featureToggleOn = this.appConfig.getAccessManagementMode();
    return featureToggleOn ?
            !this.accessGranted ? CaseViewerComponent.NON_STANDARD_USER_ACCESS_TYPES.indexOf(this.userAccessType) === -1 : true
            : true;
  }

  private suffixDuplicateTabs(tabs: CaseTab[]) {

    const count = {};
    const firstOccurences = {};

    let item, itemCount;
    for (let i = 0, c = tabs.length; i < c; i++) {
      item = tabs[i].label;
      itemCount = count[item];
      itemCount = count[item] = (itemCount == null ? 1 : itemCount + 1);

      if (count[item] > 1)
        tabs[i].label = tabs[i].label + Array(count[item] - 1).fill('_').join('');
      else
        firstOccurences[item] = i;
    }

    return tabs;
  }
}
