import { Injectable, NgZone } from '@angular/core';
import polling, { IOptions } from 'rx-polling';
import { empty, Observable, Subject, Subscription } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { Activity } from '../../domain/activity/activity.model';
import { ActivityService } from './activity.service';

// @dynamic
@Injectable()
export class ActivityPollingService {

  private readonly pendingRequests = new Map<string, Subject<Activity>>();
  private currentTimeoutHandle: any;
  private pollActivitiesSubscription: Subscription;
  private readonly pollConfig: IOptions;
  private readonly batchCollectionDelayMs: number;
  private readonly maxRequestsPerBatch: number;

  constructor(private readonly activityService: ActivityService, private readonly ngZone: NgZone, private readonly config: AbstractAppConfig) {
    this.pollConfig = {
      interval: config.getActivityNexPollRequestMs(),
      attempts: config.getActivityRetry(),
      backgroundPolling: true
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
      subject = new Subject<Activity>();
      subject.subscribe(done);
      this.pendingRequests.set(caseId, subject);
    }
    if (this.pendingRequests.size === 1) {
      this.ngZone.runOutsideAngular(() => {
        this.currentTimeoutHandle = setTimeout(
          () => this.ngZone.run(() => {
            // console.log('timeout: flushing requests')
            this.flushRequests();
          }),
          this.batchCollectionDelayMs);
      });
    }

    if (this.pendingRequests.size >= this.maxRequestsPerBatch) {
      // console.log('max pending hit: flushing requests');
      this.flushRequests();
    }
    return subject;
  }

  public stopPolling() {
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
      return empty();
    }

    return polling(this.activityService.getActivities(...caseIds), this.pollConfig);
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
      this.pollActivitiesSubscription = this.pollActivities(caseIds).subscribe(
              // process activity inside zone so it triggers change detection for activity.component.ts
        (activities: Activity[]) => this.ngZone.run( () => {
            activities.forEach((activity) => {
              // console.log('pushing activity: ' + activity.caseId);
              requests.get(activity.caseId).next(activity);
            });
          },
          (err) => {
            console.log('error: ' + err);
            Array.from(requests.values()).forEach((subject) => subject.error(err));
          }
        )
      );
    });
  }

  private postActivity(caseId: string, activityType: string): Observable<Activity[]> {
    if (!this.isEnabled) {
      return Observable.empty();
    }

    const pollingConfig = {
      ...this.pollConfig,
      interval: 5000 // inline with CCD Backend
    };

    return polling(this.activityService.postActivity(caseId, activityType), pollingConfig);
  }
}
