import { Component, Input, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseViewEvent, HttpError } from '../../domain';
import { AlertService } from '../../services';
import { CaseNotifier, CasesService } from '../case-editor';

export enum CaseTimelineDisplayMode {
  TIMELINE,
  DETAILS
}
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
    private caseNotifier: CaseNotifier,
    private casesService: CasesService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.casesService
      .getCaseViewV2(this.case)
      .pipe(
        map(caseView => {
          this.events = caseView.events;
          this.caseNotifier.announceCase(caseView);
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
