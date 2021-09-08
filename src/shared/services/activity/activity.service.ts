import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity';
import { HttpError } from '../../domain/http';
import { HttpErrorService, HttpService, OptionsType } from '../http';
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

  private static handleHttpError(response: HttpErrorResponse): HttpError {
    const error: HttpError = HttpErrorService.convertToHttpError(response);
    if (response.status && response.status !== error.status) {
      error.status = response.status;
    }
    return error;
  }

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public getOptions(): OptionsType {
    const userDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));
    console.log('userDetails', userDetails);
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', userDetails.token);
    const options: OptionsType = {
      headers: headers,
      withCredentials: true,
      observe: 'body',
    };
    return options;
  }

  public getActivities(...caseId: string[]): Observable<Activity[]> {
    try {
      const options = this.getOptions();
      const url = this.activityUrl() + `/cases/${caseId.join(',')}/activity`;
      return this.http
        .get(url, options, false, ActivityService.handleHttpError)
        .map(response => response);
    } catch (error) {
      console.log('user may not be authenticated.' + error);
    }
  }

  public postActivity(caseId: string, activity: string): Observable<Activity[]> {
    try {
      const options = this.getOptions();
      const url = this.activityUrl() + `/cases/${caseId}/activity`;
      let body = { activity };
      return this.http
        .post(url, body, options, false)
        .map(response => response);
    } catch (error) {
      console.log('user may not be authenticated.' + error);
    }
  }

  public verifyUserIsAuthorized(): void {
    console.log('session user details', this.sessionStorageService.getItem('userDetails'));
    if (this.sessionStorageService.getItem('userDetails') === undefined) {
      return;
    }

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
