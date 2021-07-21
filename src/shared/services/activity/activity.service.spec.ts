import { Observable } from 'rxjs';

import { AbstractAppConfig } from '../../../';
import { HttpService } from '../../services/http';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivityService } from './activity.service';
import { MODES } from './utils';

let httpService: any;
let appConfig: any;
let activityService: ActivityService;
let sessionStorageService: any;

const response = {
  map: () => ({})
};

describe('ActivityService', () => {

  beforeEach(() => {
    appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getActivityUrl']);
    appConfig.getActivityUrl.and.returnValue('someUrl');
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    httpService = jasmine.createSpyObj<HttpService>('httpService', ['get', 'post']);
    httpService.get.and.returnValue(Observable.of(response));
    httpService.post.and.returnValue(Observable.of(response));
    sessionStorageService.getItem.and.returnValue('\"{token: \\\"any\\\"}\"')

    activityService = new ActivityService(httpService, appConfig, sessionStorageService);
  });

  it('should default to polling mode', () => {
    expect(activityService.mode).toEqual(MODES.polling);
  });

  describe('when activity tracking is turned off', () => {
    beforeEach(() => {
      activityService.mode = MODES.off;
    });

    it('should indicate the service is disabled', () => {
      expect(activityService.isEnabled).toBeFalsy();
    });
    it('should not verify user authorization', () => {
      activityService.verifyUserIsAuthorized();
      expect(httpService.get).toHaveBeenCalledTimes(0);
    });
  });

  describe('when activity tracking is set to "polling"', () => {

    beforeEach(() => {
      // Have to toggle it as it defaults to 'polling'.
      activityService.mode = MODES.off;
      activityService.mode = MODES.polling;
    });

    it('should access AppConfig and HttpService for getActivities', () => {
      activityService.getActivities('1111');
      expect(httpService.get).toHaveBeenCalled();
      expect(appConfig.getActivityUrl).toHaveBeenCalled();
    });
    it('should accesss AppConfig and HttpService for postActivity', () => {
      activityService.postActivity('1111', 'edit');
      expect(httpService.post).toHaveBeenCalled();
      expect(appConfig.getActivityUrl).toHaveBeenCalled();
    });
    it('should verify user authorization once', () => {
      activityService.verifyUserIsAuthorized();
      activityService.verifyUserIsAuthorized();

      expect(httpService.get).toHaveBeenCalledTimes(1);
      expect(activityService.isEnabled).toBeTruthy();
    });
  });

  describe('when activity url is empty', () => {

    beforeEach(() => {
      appConfig.getActivityUrl.and.returnValue('');
      activityService['userAuthorised'] = true;
      // Have to toggle it as it defaults to 'polling'.
      activityService.mode = MODES.off;
      activityService.mode = MODES.polling;
    });

    it('should not be enabled', () => {
      expect(activityService.isEnabled).toBeFalsy();
    });
  });

  describe('when an error is returned while verifying the user is authorised', () => {
    const goError = (status: number): void => {
      const error = { status };
      httpService.get.and.returnValue(Observable.throw(error));
      // Have to toggle it as it defaults to 'polling'.
      activityService.mode = MODES.off;
      activityService.mode = MODES.polling;
    };
    it('should not be enabled when the error is 401', () => {
      goError(401);
      expect(activityService.isEnabled).toBeFalsy();
    });
    it('should not be enabled when the error is 403', () => {
      goError(403);
      expect(activityService.isEnabled).toBeFalsy();
    });
    it('should be enabled when the error is something other than 401 or 403', () => {
      goError(400);
      expect(activityService.isEnabled).toBeTruthy();
    });
  });
});
