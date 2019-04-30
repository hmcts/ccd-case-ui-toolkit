import { Component, Input, OnInit } from '@angular/core';
import { CaseViewEvent, HttpError } from '../../domain';
import { CasesService, CaseService } from '../case-editor';
import { AlertService } from '../../services';
import { map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
  selector: 'ccd-case-timeline',
  templateUrl: './case-timeline.component.html'
})
export class CaseTimelineComponent implements OnInit {

  @Input()
  case: string;

  events: CaseViewEvent[];
  selectedEventId: string;
  dspMode = CaseTimelineDisplayMode;
  displayMode: CaseTimelineDisplayMode = CaseTimelineDisplayMode.TIMELINE;

  constructor(
    private caseService: CaseService,
    private casesService: CasesService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.casesService
      .getCaseViewV2(this.case)
      .pipe(
        map(caseView => {
          this.events = caseView.events;
          this.caseService.announceCase(caseView);
        })
      )
      .toPromise()
      .catch((error: HttpError) => {
        this.alertService.error(error.message);
        return throwError(error);
      });
  }

  isDataLoaded(): boolean {
    return this.events ? true : false;
  }

  caseHistoryClicked(eventId: string) {
    this.displayMode = CaseTimelineDisplayMode.DETAILS;
    this.selectedEventId = eventId;
  }

  public goToCaseTimeline(): void {
    this.displayMode = CaseTimelineDisplayMode.TIMELINE;
  }
}

export enum CaseTimelineDisplayMode {
  TIMELINE,
  DETAILS
}
