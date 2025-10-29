import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { HttpError } from '../../domain/http/http-error.model';
import { HttpErrorService, HttpService, OptionsType } from '../http';
import { SessionStorageService } from '../session';
import { USER_DETAILS } from '../../utils';
import { MODES } from '../activity/utils';

// @dynamic
@Injectable()
export class ActivityService {
  constructor(
    private readonly http: HttpService,
    private readonly appConfig: AbstractAppConfig,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public get isEnabled(): boolean {
    return this.mode !== MODES.off && this.activityUrl && this.userAuthorised;
  }

  public static readonly MODES = MODES;
  public static readonly DUMMY_CASE_REFERENCE = '0';
  public static get ACTIVITY_VIEW() { return 'view'; }
  public static get ACTIVITY_EDIT() { return 'edit'; }

  public readonly modeSubject: BehaviorSubject<MODES> = new BehaviorSubject<MODES>(MODES.off);

  private userAuthorised: boolean = undefined;
  private pMode: MODES = MODES.off;
  public get mode(): MODES {
    return this.pMode;
  }
  public set mode(value: MODES) {
    if (!!value && this.pMode !== value) {
      this.pMode = value;
      this.modeSubject.next(value);
      if (this.pMode !== MODES.off) {
        this.verifyUserIsAuthorized();
      }
    }
  }
  private pActivityUrl: string;
  private pActivityUrlSet = false;
  private get activityUrl(): string {
    if (!this.pActivityUrlSet) {
      this.setupActivityUrl();
    }
    return this.pActivityUrl;
  }

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
      const url = `${this.activityUrl}/cases/${caseId.join(',')}/activity`;
      return this.http.get(url, options, false, ActivityService.handleHttpError);
    } catch (error) {
      console.log(`user may not be authenticated.${error}`);
    }
  }

  public postActivity(caseId: string, activity: string): Observable<Activity[]> {
    try {
      const options = this.getOptions();
      const url = `${this.activityUrl}/cases/${caseId}/activity`;
      const body = { activity };
      return this.http.post(url, body, options, false);
    } catch (error) {
      console.log(`user may not be authenticated.${error}`);
    }
  }

  public verifyUserIsAuthorized(): void {
     if (this.activityUrl && this.userAuthorised === undefined) {
      if (this.mode === MODES.polling) {
        this.getActivities(ActivityService.DUMMY_CASE_REFERENCE).subscribe(
          () => this.userAuthorised = true,
          error => {
            if ([401, 403].includes(error.status)) {
              this.userAuthorised = false;
            } else {
              this.userAuthorised = true;
            }
        });
      } else if (this.mode !== MODES.off) {
        this.userAuthorised = true;
      }
    }
  }

 private setupActivityUrl(): void {
    this.pActivityUrl = this.appConfig.getActivityUrl();
    this.pActivityUrlSet = true;
  }
}
