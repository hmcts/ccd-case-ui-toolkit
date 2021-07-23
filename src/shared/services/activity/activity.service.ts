import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity';
import { HttpService, OptionsType } from '../http';
import { SessionStorageService } from '../session';

// @dynamic
@Injectable()
export class ActivityService {
  static readonly DUMMY_CASE_REFERENCE = '0';
  static get ACTIVITY_VIEW() { return 'view'; }
  static get ACTIVITY_EDIT() { return 'edit'; }

  private userAuthorised: boolean = undefined;

  public get isEnabled(): boolean {
    return this.activityUrl() && this.userAuthorised;
  }

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public getOptions(): OptionsType {
    const userDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', userDetails.token);
    const options: OptionsType = {
      headers: headers,
      withCredentials: true,
      observe: 'body',
    };
    return options;
  }

  public getActivities(...caseId: string[]): Observable<Activity[]> {
    const options = this.getOptions();
    const url = this.activityUrl() + `/cases/${caseId.join(',')}/activity`;
    return this.http
      .get(url, options, false)
      .map(response => response);
  }

  public postActivity(caseId: string, activity: string): Observable<Activity[]> {
    const options = this.getOptions();
    const url = this.activityUrl() + `/cases/${caseId}/activity`;
    let body = { activity };
    return this.http
      .post(url, body, options, false)
      .map(response => response);
  }

  public verifyUserIsAuthorized(): void {
    if (this.activityUrl() && this.userAuthorised === undefined) {
      this.getActivities(ActivityService.DUMMY_CASE_REFERENCE).subscribe(
        () => this.userAuthorised = true,
        error => {
          if ([401, 403].indexOf(error.status) > -1) {
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

}
