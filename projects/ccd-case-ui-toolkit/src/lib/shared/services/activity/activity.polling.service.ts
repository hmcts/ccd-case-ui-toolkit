import { Injectable, NgZone } from '@angular/core';
import { concat, defer, EMPTY, Observable, Subject, Subscription, timer } from 'rxjs';
import { repeat, retry, switchMap } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { ActivityService } from './activity.service';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { MODES } from './utils';

interface PollingOptions {
  interval: number;
  attempts?: number;
  exponentialUnit?: number;
  backgroundPolling?: boolean;
}

// @dynamic
@Injectable()
export class ActivityPollingService {
  private readonly pendingRequests = new Map<string, Subject<Activity>>();
  private currentTimeoutHandle: any;
  private pollActivitiesSubscription: Subscription;
  private pollConfig: PollingOptions;
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
    return this.activityService.isEnabled && (this.activityService.mode === MODES.polling || this.activityService.mode === MODES.socket);
  }


  public subscribeToActivity(caseId: string, done: (activity: Activity) => void): Subject<Activity> {
    if (!this.isEnabled) {
      return new Subject<Activity>();
    }

    let subject = this.pendingRequests.get(caseId);
    if (subject) {
      subject.subscribe(done);
    } else {
      // Only the first pending request should start the batch collection timer.
      const wasEmpty = this.pendingRequests.size === 0;
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

    if (!this.pendingRequests.size) {
      return;
    }

    const requests = new Map(this.pendingRequests);
    this.pendingRequests.clear();
    this.performBatchRequest(requests);
  }

  public pollActivities(...caseIds: string[]): Observable<Activity[]> {
    if (!this.isEnabled) {
      return EMPTY;
    }

    return this.polling(this.activityService.getActivities(...caseIds), this.pollConfig);
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

    const pollingConfig: PollingOptions = {
      ...this.pollConfig,
      interval: 5000 // inline with CCD Backend
    };

    return this.polling(this.activityService.postActivity(caseId, activityType), pollingConfig);
  }

  private addPendingRequest(caseId: string, subject: Subject<Activity>): void {
    this.pendingRequests.set(caseId, subject);

    // Components complete their returned Subject on destroy; remove it so a later same-case subscription gets a fresh Subject.
    subject.subscribe({
      complete: () => this.removePendingRequest(caseId, subject),
      error: () => this.removePendingRequest(caseId, subject)
    });
  }

  private removePendingRequest(caseId: string, subject: Subject<Activity>): void {
    if (this.pendingRequests.get(caseId) !== subject) {
      return;
    }

    this.pendingRequests.delete(caseId);

    if (!this.pendingRequests.size && this.currentTimeoutHandle) {
      clearTimeout(this.currentTimeoutHandle);
      this.currentTimeoutHandle = undefined;
    }
  }

  private polling<T>(request$: Observable<T>, options: PollingOptions): Observable<T> {
    const pollingOptions = {
      interval: options.interval,
      attempts: options.attempts ?? 9,
      exponentialUnit: options.exponentialUnit ?? 1000
    };

    return concat(
      request$,
      defer(() => timer(pollingOptions.interval).pipe(switchMap(() => request$))).pipe(repeat())
    ).pipe(
      // Preserve consecutive-failure retry behaviour using the current RxJS retry config.
      retry({
        count: pollingOptions.attempts,
        delay: (_error, retryCount) => timer(this.getExponentialRetryDelay(retryCount, pollingOptions.exponentialUnit)),
        resetOnSuccess: true
      })
    );
  }

  private getExponentialRetryDelay(consecutiveErrorsCount: number, exponentialUnit: number): number {
    return Math.pow(2, consecutiveErrorsCount - 1) * exponentialUnit;
  }
}
