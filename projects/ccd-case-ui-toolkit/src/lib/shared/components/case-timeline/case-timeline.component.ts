import { Component, Input, OnInit } from '@angular/core';
import { throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { CaseViewEvent } from '../../domain/case-view/case-view-event.model';
import { HttpError } from '../../domain/http/http-error.model';
import { AlertService } from '../../services/alert/alert.service';
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
  public case: string;

  public events: CaseViewEvent[];
  public selectedEventId: string;
  public dspMode = CaseTimelineDisplayMode;
  public displayMode: CaseTimelineDisplayMode = CaseTimelineDisplayMode.TIMELINE;

  constructor(
    private readonly caseNotifier: CaseNotifier,
    private readonly casesService: CasesService,
    private readonly alertService: AlertService,
  ) {}

  public ngOnInit() {
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

  public isDataLoaded(): boolean {
    return this.events ? true : false;
  }

  public caseHistoryClicked(eventId: string) {
    this.displayMode = CaseTimelineDisplayMode.DETAILS;
    this.selectedEventId = eventId;
  }

  public goToCaseTimeline(): void {
    this.displayMode = CaseTimelineDisplayMode.TIMELINE;
  }
}
