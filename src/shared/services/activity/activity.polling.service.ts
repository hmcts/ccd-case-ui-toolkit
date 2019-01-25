import { Injectable } from '@angular/core';
import { Activity } from '../../domain/activity/activity.model';
import { ActivityService } from './activity.service';
import { Observable, Subscription } from 'rxjs';
import { Subject } from 'rxjs';
import { NgZone } from '@angular/core';
import polling, { IOptions } from 'rx-polling';
import { AbstractAppConfig } from '../../../app.config';

// @dynamic
@Injectable()
export class ActivityPollingService {

  private pendingRequests = new Map<string, Subject<Activity>>();
  private currentTimeoutHandle: any;
  private pollActivitiesSubscription: Subscription;
  private pollConfig: IOptions;
  private batchCollectionDelayMs: number;
  private maxRequestsPerBatch: number;

  constructor(private activityService: ActivityService, private ngZone: NgZone, private config: AbstractAppConfig) {
    this.pollConfig = {
      interval: config.getActivityNexPollRequestMs(),
      attempts: config.getActivityRetry(),
    };
    this.batchCollectionDelayMs = config.getActivityBatchCollectionDelayMs();
    this.maxRequestsPerBatch = config.getActivityMaxRequestPerBatch();
  }

  subscribeToActivity(caseId: string, done: (activity: Activity) => void): Subject<Activity> {
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

  stopPolling() {
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

  pollActivities(...caseIds: string[]): Observable<Activity[]> {
    if (!this.isEnabled) {
      return Observable.empty();
    }

    return polling(this.activityService.getActivities(...caseIds), this.pollConfig);
  }

  protected performBatchRequest(requests: Map<string, Subject<Activity>>): void {
    const caseIds = Array.from(requests.keys()).join();
    // console.log('issuing batch request for cases: ' + caseIds);
    this.pollActivitiesSubscription = this.pollActivities(caseIds).subscribe(
      (activities: Activity[]) => {
        activities.forEach((activity) => {
          // console.log('pushing activity: ' + activity.caseId);
          requests.get(activity.caseId).next(activity);
        });
      },
      (err) => {
        console.log('error: ' + err);
        Array.from(requests.values()).forEach((subject) => subject.error(err));
      }
    );
  }

  postViewActivity(caseId: string): Observable<Activity[]> {
    return this.postActivity(caseId, ActivityService.ACTIVITY_VIEW);
  }

  postEditActivity(caseId: string): Observable<Activity[]> {
    return this.postActivity(caseId, ActivityService.ACTIVITY_EDIT);
  }

  private postActivity(caseId: string, activityType: string): Observable<Activity[]> {
    if (!this.isEnabled) {
      return Observable.empty();
    }

    return polling(this.activityService.postActivity(caseId, activityType), this.pollConfig);
  }

  get isEnabled(): boolean {
    return this.activityService.isEnabled;
  }
}
