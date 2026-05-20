import { Injectable, NgZone } from '@angular/core';
import { concat, defer, EMPTY, Observable, Subject, Subscription, timer } from 'rxjs';
import { repeat, retry, switchMap } from 'rxjs/operators';
import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { ActivityService } from './activity.service';

interface PollingOptions {
  interval: number;
  attempts?: number;
  exponentialUnit?: number;
}

// @dynamic
@Injectable()
export class ActivityPollingService {
  private readonly pendingRequests = new Map<string, Subject<Activity>>();
  private currentTimeoutHandle: ReturnType<typeof setTimeout> | undefined;
  private pollActivitiesSubscription: Subscription | undefined;
  private readonly pollConfig: PollingOptions;
  private readonly batchCollectionDelayMs: number;
  private readonly maxRequestsPerBatch: number;

  constructor(private readonly activityService: ActivityService, private readonly ngZone: NgZone, private readonly config: AbstractAppConfig) {
    this.pollConfig = {
      interval: config.getActivityNexPollRequestMs(),
      attempts: config.getActivityRetry()
    };
    this.batchCollectionDelayMs = config.getActivityBatchCollectionDelayMs();
    this.maxRequestsPerBatch = config.getActivityMaxRequestPerBatch();
  }

  public get isEnabled(): boolean {
    return this.activityService.isEnabled;
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
      this.addPendingRequest(caseId, subject);

      if (wasEmpty) {
        this.ngZone.runOutsideAngular(() => {
          this.currentTimeoutHandle = setTimeout(
            () => this.ngZone.run(() => {
              this.flushRequests();
            }),
            this.batchCollectionDelayMs);
        });
      }
    }

    if (this.pendingRequests.size >= this.maxRequestsPerBatch) {
      // console.log('max pending hit: flushing requests');
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

  protected performBatchRequest(requests: Map<string, Subject<Activity>>): void {
    const caseIds = Array.from(requests.keys()).join();
    // console.log('issuing batch request for cases: ' + caseIds);
    this.ngZone.runOutsideAngular( () => {
      // run polling outside angular zone so it does not trigger change detection
      this.pollActivitiesSubscription = this.pollActivities(caseIds).subscribe({
        // process activity inside zone so it triggers change detection for activity.component.ts
        next: (activities: Activity[]) => this.ngZone.run(() => {
          activities.forEach((activity) => {
            // console.log('pushing activity: ' + activity.caseId);
            // Ignore activities returned for cases outside this local batch.
            requests.get(activity.caseId)?.next(activity);
          });
        }),
        error: (err) => this.ngZone.run(() => {
          console.log(`error: ${err}`);
          Array.from(requests.values()).forEach((subject) => subject.error(err));
        })
      });
    });
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
