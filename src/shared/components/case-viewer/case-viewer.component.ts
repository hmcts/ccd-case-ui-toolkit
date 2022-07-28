import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { CaseField, CaseTab, CaseView } from '../../domain';
import { CaseNotifier } from '../case-editor';

@Component({
  selector: 'ccd-case-viewer',
  templateUrl: './case-viewer.component.html'
})
export class CaseViewerComponent implements OnInit, OnDestroy {

  public static readonly METADATA_FIELD_ACCESS_PROCEES_ID = '[ACCESS_PROCESS]';
  public static readonly NON_STANDARD_USER_ACCESS_TYPES = ['CHALLENGED', 'SPECIFIC'];

  @Input() public hasPrint = true;
  @Input() public hasEventSelector = true;

  @Input() public prependedTabs: CaseTab[] = [];
  @Input() public appendedTabs: CaseTab[] = [];
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
    if (this.caseSubscription) {
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
    // remove once CCD starts sending CAM data or Access management goes live
    this.setMockData(caseDetails);
    if (caseDetails && Array.isArray(caseDetails.metadataFields)) {
      const access_process = caseDetails.metadataFields.find(metadataField =>
        metadataField.id === CaseViewerComponent.METADATA_FIELD_ACCESS_PROCEES_ID);
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

  // remove once Access management goes live
  private setMockData(caseDetails: CaseView): void {
    const accessManagementBasicViewMock = this.appConfig.getAccessManagementBasicViewMock();
    if (accessManagementBasicViewMock && accessManagementBasicViewMock.active && !caseDetails.basicFields) {
      const access_process_index = caseDetails.metadataFields.findIndex(metadataField =>
        metadataField.id === CaseViewerComponent.METADATA_FIELD_ACCESS_PROCEES_ID);

      if (access_process_index > -1) {
        caseDetails.metadataFields[access_process_index].value = accessManagementBasicViewMock.accessProcess;
      } else {
        const access_process: CaseField = new CaseField();
        access_process.id = CaseViewerComponent.METADATA_FIELD_ACCESS_PROCEES_ID;
        access_process.value = accessManagementBasicViewMock.accessProcess;
        access_process.field_type = {
          id: '',
          type: 'Text'
        };
        caseDetails.metadataFields.push(access_process);
      }

      caseDetails.basicFields = accessManagementBasicViewMock.basicFields;

    }
  }
}
