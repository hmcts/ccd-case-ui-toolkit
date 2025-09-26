import { Injectable, NgZone } from '@angular/core';
import { EMPTY, Observable, Subject, Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { ActivityService } from './activity.service';
import { polling, IOptions } from 'rx-polling-hmcts';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { MODES } from './utils';

// @dynamic
@Injectable()
export class ActivityPollingService {
  private readonly pendingRequests = new Map<string, Subject<Activity>>();
  private currentTimeoutHandle: any;
  private pollActivitiesSubscription: Subscription;
  private pollConfig: IOptions;
  private batchCollectionDelayMs: number;
  private maxRequestsPerBatch: number;

  constructor(
    private readonly activityService: ActivityService,
    private readonly ngZone: NgZone,
    private readonly config: AbstractAppConfig
  ) {
    this.activityService.modeSubject
      .pipe(filter(mode => !!mode))
      .pipe(distinctUntilChanged())
      .subscribe(mode => {
        this.stopPolling();
        if (mode === MODES.polling) {
          this.init();
        }
      });
  }

  public get isEnabled(): boolean {
    return this.activityService.isEnabled && this.activityService.mode === MODES.polling;
  }


  public subscribeToActivity(caseId: string, done: (activity: Activity) => void): Subject<Activity> {
    if (!this.isEnabled) {
      return new Subject<Activity>();
    }

    let subject = this.pendingRequests.get(caseId);
    if (subject) {
      subject.subscribe(done);
    } else {
      subject = new Subject<Activity>();
      subject.subscribe(done);
      this.pendingRequests.set(caseId, subject);
    }
    if (this.pendingRequests.size === 1) {
      this.ngZone.runOutsideAngular(() => {
        this.currentTimeoutHandle = setTimeout(
          () => this.ngZone.run(() => {
            this.flushRequests();
          }),
          this.batchCollectionDelayMs);
      });
    }

    if (this.pendingRequests.size >= this.maxRequestsPerBatch) {
      this.flushRequests();
    }
    return subject;
  }

  public stopPolling(): void {
    if (this.pollActivitiesSubscription) {
      this.pollActivitiesSubscription.unsubscribe();
    }
  }

  public flushRequests(): void {
    if (this.currentTimeoutHandle) {
      clearTimeout(this.currentTimeoutHandle);
      this.currentTimeoutHandle = undefined;
    }

    const requests = new Map(this.pendingRequests);
    this.pendingRequests.clear();
    this.performBatchRequest(requests);
  }

  public pollActivities(...caseIds: string[]): Observable<Activity[]> {
    if (!this.isEnabled) {
      return EMPTY;
    }

    return polling(this.activityService.getActivities(...caseIds), this.pollConfig);
  }

  public postViewActivity(caseId: string): Observable<Activity[]> {
    return this.postActivity(caseId, ActivityService.ACTIVITY_VIEW);
  }

  public postEditActivity(caseId: string): Observable<Activity[]> {
    return this.postActivity(caseId, ActivityService.ACTIVITY_EDIT);
  }

   private init(): void {
    this.pollConfig = {
      interval: this.config.getActivityNexPollRequestMs(),
      attempts: this.config.getActivityRetry(),
      backgroundPolling: true
    };
    this.batchCollectionDelayMs = this.config.getActivityBatchCollectionDelayMs();
    this.maxRequestsPerBatch = this.config.getActivityMaxRequestPerBatch();
  }


  private performBatchRequest(requests: Map<string, Subject<Activity>>): void {
    const caseIds = Array.from(requests.keys()).join();

    // Pre-bind handlers to avoid deeply nested inline callbacks
    const onNext = this.createActivitiesHandler(requests);
    const onError = this.createErrorHandler(requests);

    this.ngZone.runOutsideAngular(() => {
      // run polling outside angular zone so it does not trigger change detection
      this.pollActivitiesSubscription = this.pollActivities(caseIds).subscribe({
        next: onNext,
        error: onError
      });
    });
  }

  private createActivitiesHandler(requests: Map<string, Subject<Activity>>) {
    // single-level function: process inside Angular zone
    return (activities: Activity[]) => this.processActivitiesInsideZone(activities, requests);
  }

  private processActivitiesInsideZone(
    activities: Activity[],
    requests: Map<string, Subject<Activity>>
  ): void {
    // process activity inside zone so it triggers change detection for activity.component.ts
    this.ngZone.run(() => {
      for (const activity of activities) {
        const subject = requests.get(activity.caseId);
        if (subject) {
          subject.next(activity);
        }
      }
    });
  }

  private createErrorHandler(requests: Map<string, Subject<Activity>>) {
    return (err: unknown) => this.handlePollingError(err, requests);
  }

  private handlePollingError(err: unknown, requests: Map<string, Subject<Activity>>): void {
    for (const subject of requests.values()) {
      if (!subject.closed) {
        subject.error(err);
      }
    }
  }

  private postActivity(caseId: string, activityType: string): Observable<Activity[]> {
    if (!this.isEnabled) {
      return EMPTY;
    }

    const pollingConfig = {
      ...this.pollConfig,
      interval: 5000 // inline with CCD Backend
    };

    return polling(this.activityService.postActivity(caseId, activityType), pollingConfig);
  }
}
