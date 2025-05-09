import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { HttpError } from '../../domain/http/http-error.model';
import { HttpErrorService, HttpService, OptionsType } from '../http';
import { SessionStorageService } from '../session';
import { USER_DETAILS } from '../../utils';

// @dynamic
@Injectable()
export class ActivityService {
  public static get ACTIVITY_VIEW() { return 'view'; }
  public static get ACTIVITY_EDIT() { return 'edit'; }

  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public get isEnabled(): boolean {
    return this.activityUrl() && this.userAuthorised;
  }
  public static readonly DUMMY_CASE_REFERENCE = '0';

  private userAuthorised: boolean = undefined;

  private static handleHttpError(response: HttpErrorResponse): HttpError {
    const error: HttpError = HttpErrorService.convertToHttpError(response);
    if (response?.status !== error.status) {
      error.status = response.status;
    }
    return error;
  }

  public getOptions(): OptionsType {
    const userDetails = JSON.parse(this.sessionStorageService.getItem(USER_DETAILS));
    const headers = new HttpHeaders().set('Content-Type', 'application/json').set('Authorization', userDetails.token);
    return {
      headers,
      withCredentials: true,
      observe: 'body',
    };
  }

  public getActivities(...caseId: string[]): Observable<Activity[]> {
    try {
      const options = this.getOptions();
      const url = `${this.activityUrl()}/cases/${caseId.join(',')}/activity`;
      return this.http
        .get(url, options, false, ActivityService.handleHttpError)
        .pipe(
          map(response => response)
        );
    } catch (error) {
      console.log(`user may not be authenticated.${error}`);
    }
  }

  public postActivity(caseId: string, activity: string): Observable<Activity[]> {
    try {
      const options = this.getOptions();
      const url = `${this.activityUrl()}/cases/${caseId}/activity`;
      const body = { activity };
      return this.http
        .post(url, body, options, false)
        .pipe(
          map(response => response)
        );
    } catch (error) {
      console.log(`user may not be authenticated.${error}`);
    }
  }

  public verifyUserIsAuthorized(): void {
    if (this.sessionStorageService.getItem(USER_DETAILS) && this.activityUrl() && this.userAuthorised === undefined) {
      this.getActivities(ActivityService.DUMMY_CASE_REFERENCE).subscribe(
        () => this.userAuthorised = true,
        error => {
          this.userAuthorised = [401, 403].indexOf(error.status) <= -1;
        }
      );
    }
  }

  private activityUrl(): string {
    return this.appConfig.getActivityUrl();
  }
}
