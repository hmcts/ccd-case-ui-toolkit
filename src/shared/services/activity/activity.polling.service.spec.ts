
import { ActivityService } from './activity.service';
import { ActivityPollingService } from './activity.polling.service';
import { NgZone } from '@angular/core';
import { Observable } from 'rxjs';

const CASE_ID = '22';
const CASES = ['111', '222', '333'];

let ngZone: any;
let activityService: any;
let activityPollingService: ActivityPollingService;
let appConfig;

describe('ActivityPollingService', () => {

  beforeEach(() => {
    ngZone = jasmine.createSpyObj<NgZone>('ngZone', ['run', 'runOutsideAngular']);
    ngZone.runOutsideAngular.and.callFake((fn: Function) => fn());

    activityService = jasmine.createSpyObj<ActivityService>('activityService', ['getActivities', 'postActivity']);
    activityService.getActivities.and.returnValue(Observable.of());
    activityService.isEnabled = true;

    appConfig = jasmine.createSpyObj('AppConfig', ['getActivityMaxRequestPerBatch', 'getActivityBatchCollectionDelayMs',
                                                    'getActivityNexPollRequestMs', 'getActivityRetry']);
    appConfig.getActivityBatchCollectionDelayMs.and.returnValue(1);
    appConfig.getActivityMaxRequestPerBatch.and.returnValue(25);
    appConfig.getActivityNexPollRequestMs.and.returnValue(5000);
    appConfig.getActivityRetry.and.returnValue(5);

    activityPollingService = new ActivityPollingService(activityService, ngZone, appConfig);
  });

  it('should accesss activityService for pollActivities', () => {
    activityPollingService.pollActivities(...CASES);
    expect(activityService.getActivities).toHaveBeenCalledWith(...CASES);
  });

  it('should accesss activityService for subscribe', () => {
    activityPollingService.subscribeToActivity('111', () => ({}));
    activityPollingService.subscribeToActivity('222', () => ({}));
    activityPollingService.subscribeToActivity('333', () => ({}));
    activityPollingService.subscribeToActivity('111', () => ({}));

    activityPollingService.flushRequests();

    expect(activityService.getActivities).toHaveBeenCalledWith('111,222,333');

    activityPollingService.subscribeToActivity('444', () => ({}));
    activityPollingService.subscribeToActivity('555', () => ({}));

    activityPollingService.flushRequests();

    expect(activityService.getActivities).toHaveBeenCalledWith('444,555');
  });

  it('should accesss activityService to post view activities', () => {
    const res = activityPollingService.postViewActivity(CASE_ID);
    const subscription = res.subscribe(() => {
      expect(activityService.postActivity).toHaveBeenCalledWith(CASE_ID, ActivityService.ACTIVITY_VIEW);
    });
    subscription ? subscription.unsubscribe() : null;
  });

  it('should not accesss activityService to post view activities if disabled', () => {
    activityService.isEnabled = false;
    activityPollingService.postViewActivity(CASE_ID);

    expect(activityService.postActivity).not.toHaveBeenCalled();
  });

  it('should accesss activityService to post edit activities', () => {
    const res = activityPollingService.postEditActivity(CASE_ID);
    const subscription = res.subscribe(() => {
      expect(activityService.postActivity).toHaveBeenCalledWith(CASE_ID, ActivityService.ACTIVITY_EDIT);
    });
    subscription ? subscription.unsubscribe() : null;
  });

  it('should not accesss activityService to post edit activities if disabled', () => {
    activityService.isEnabled = false;
    activityPollingService.postEditActivity(CASE_ID);

    expect(activityService.postActivity).not.toHaveBeenCalled();
  });

  it('should not accesss activityService for pollActivities when disabled', () => {
    activityService.isEnabled = false;
    activityPollingService.pollActivities('');

    expect(activityService.getActivities).not.toHaveBeenCalled();
  });

  it('should not accesss activityService for pollActivities when disabled', () => {
    activityService.isEnabled = false;
    activityPollingService.subscribeToActivity('222', () => ({}));

    expect(ngZone.runOutsideAngular).not.toHaveBeenCalled();
  });

  it('should clear pending requests and timer after flushRequests is called', () => {
    activityPollingService.subscribeToActivity('222', () => ({}));
    expect(ngZone.runOutsideAngular).toHaveBeenCalled();

    activityPollingService.flushRequests();
    expect(activityPollingService['pendingRequests'].size).toEqual(0);
    expect(activityPollingService['currentTimeoutHandle']).toBeUndefined();
  });

  it('should return is enabled when activity service is enabled', () => {
    activityService.isEnabled = true;

    expect(activityPollingService.isEnabled).toBe(true);
  });

  it('should return is disabled when activity service is disabled', () => {
    activityService.isEnabled = false;

    expect(activityPollingService.isEnabled).toBe(false);
  });

  it('should unsubscribe', () => {
    activityPollingService.subscribeToActivity('222', () => ({}));
    activityPollingService.flushRequests();

    expect(activityPollingService['pollActivitiesSubscription'].closed).toBe(false);

    activityPollingService.stopPolling();

    expect(activityPollingService['pollActivitiesSubscription'].closed).toBe(true);
  });
});
