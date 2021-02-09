import { Injectable } from '@angular/core';
import { Activity } from '../../domain/activity';
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../../services/http';

// @dynamic
@Injectable()
export class ActivityService {
  static readonly DUMMY_CASE_REFERENCE = '0';
  static get ACTIVITY_VIEW() { return 'view'; }
  static get ACTIVITY_EDIT() { return 'edit'; }

  private userAuthorised;

  constructor(private http: HttpService, private appConfig: AbstractAppConfig) {}

  getActivities(...caseId: string[]): Observable<Activity[]> {
    const url = this.activityUrl() + `/cases/${caseId.join(',')}/activity`;
    return this.http
      .get(url, null, false)
      .map(response => response);
  }

  postActivity(caseId: string, activityType: String): Observable<Activity[]> {
    const url = this.activityUrl() + `/cases/${caseId}/activity`;
    let body = { activity: activityType};
    return this.http
      .post(url, body, null, false)
      .map(response => response);
  }

  verifyUserIsAuthorized(): void {
    if (this.activityUrl() && this.userAuthorised === undefined) {
      this.getActivities(ActivityService.DUMMY_CASE_REFERENCE).subscribe(
        data => this.userAuthorised = true,
        error => {
            if (error.status === 403) {
              this.userAuthorised = false;
            } else {
              this.userAuthorised = true
            }
        }
      );
    }
  }

  private activityUrl(): string {
    return this.appConfig.getActivityUrl();
  }

  get isEnabled(): boolean {
    return this.activityUrl() && this.userAuthorised;
  }

}
