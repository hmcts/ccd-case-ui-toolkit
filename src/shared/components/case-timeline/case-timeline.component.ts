import { Component, Input, OnInit } from '@angular/core';
import { CaseViewEvent, HttpError } from '../../domain';
import { CasesService } from '../case-editor';
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

  constructor(
    private casesService: CasesService,
    private alertService: AlertService,
  ) {}

  ngOnInit() {
    this.casesService
      .getCaseViewV2(this.case)
      .pipe(
        map(caseView => {
          this.events = caseView.events;
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

}
