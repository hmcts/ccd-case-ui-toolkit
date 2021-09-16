import { Component, Input, OnInit } from '@angular/core';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseView } from '../../../domain';

@Component({
  selector: 'ccd-case-basic-access-view',
  templateUrl: 'case-basic-access-view.component.html'
})
export class CaseBasicAccessViewComponent implements OnInit {

  @Input()
  public caseDetails: CaseView = null;

  @Input()
  public accessType: string = null;

  constructor(
    private readonly appConfig: AbstractAppConfig
  ) {}

  ngOnInit(): void {
    // remove once Access management goes live
    this.setMockData();
  }


  // remove once Access management goes live
  private setMockData(): void {
    if (this.appConfig.getAccessManagementBasicViewMockMode() && !this.caseDetails.basicFields) {
      const basicFields = {
        caseNameHmctsInternal: 'Robert Saddlebrook',
        caseManagementLocation: {
          baseLocation: 101
        }
      }

      this.caseDetails = {
       ...this.caseDetails,
       basicFields 
      }

    }
  }

}
