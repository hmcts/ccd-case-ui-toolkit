import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity';
import { HttpService, OptionsType } from '../../services/http';
import { MODES } from '../activity/utils';
import { SessionStorageService } from '../session/session-storage.service';

// @dynamic
@Injectable()
export class ActivityService {
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

  public get isEnabled(): boolean {
    return this.mode !== MODES.off && this.activityUrl && this.userAuthorised;
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
    const url = `${this.activityUrl}/cases/${caseId.join(',')}/activity`;
    return this.http
      .get(url, options, false)
      .map(response => response);
  }

  public postActivity(caseId: string, activityType: String): Observable<Activity[]> {
    const options = this.getOptions();
    const url = `${this.activityUrl}/cases/${caseId}/activity`;
    let body = { activity: activityType};
    return this.http
      .post(url, body, options, false)
      .map(response => response);
  }

  public verifyUserIsAuthorized(): void {
    if (this.activityUrl && this.userAuthorised === undefined) {
      if (this.mode === MODES.polling) {
        this.getActivities(ActivityService.DUMMY_CASE_REFERENCE).subscribe(
          () => this.userAuthorised = true,
          error => {
            if ([401, 403].indexOf(error.status) > -1) {
              this.userAuthorised = false;
            } else {
              this.userAuthorised = true;
            }
          }
        );
      } else if (this.mode !== MODES.off) {
        // TODO: Implement a proper authorisation mechanism for sockets.
        this.userAuthorised = true;
      }
    }
  }

  private setupActivityUrl(): void {
    this.pActivityUrl = this.appConfig.getActivityUrl();
    this.pActivityUrlSet = true;
  }

}
