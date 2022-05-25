import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { CaseField } from '../../../../../domain/definition';
import { CaseView } from '../../../../../domain';
import { CasesService } from '../../../../case-editor/services/cases.service';
import { LinkedCasesResponse } from '../../domain/linked-cases.model';
import { ActivatedRoute } from '@angular/router';

export enum PageType {
  LINKEDCASESTABLBEVIEW = 'linkedCasesTableView',
  PROPOSEDCASELINK = 'proposedCaseLink',
}

@Component({
  selector: 'ccd-linked-cases-from-table',
  templateUrl: './linked-cases-from-table.component.html'
})

export class LinkedCasesFromTableComponent implements OnInit, AfterViewInit {
  @Input()
  caseField: CaseField;
  @Input()
  public type: PageType = PageType.LINKEDCASESTABLBEVIEW;
  public tableSubHeading = 'This case is linked from';

  public caseDetails: CaseView;
  public parentUrl: string;
  public isLoaded: boolean;
  public getLinkedCasesResponse: LinkedCasesResponse;

  public caseId: string;

  constructor(
    private route: ActivatedRoute,
    private readonly casesService: CasesService) {}
    public ngAfterViewInit(): void {
      const labelField = document.getElementsByClassName('case-viewer-label');
      if (labelField && labelField.length) {
        labelField[0].replaceWith('');
      }
    }

    public ngOnInit(): void {
      this.caseId = this.route.snapshot.data.case.case_id;
      this.casesService.getLinkedCases(this.caseId).subscribe(response => {
          this.getLinkedCasesResponse = response
        });
    }
}
