import { Observable, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { SessionStorageService } from '../session';
import { ActivityService } from './activity.service';
import { MODES } from './utils';

let httpService: any;
let appConfig: any;
let activityService: ActivityService;
let sessionStorageService: any;

const response = {
  map: () => ({})
};

xdescribe('ActivityService', () => {
  beforeEach((() => {
    appConfig = jasmine.createSpyObj<AbstractAppConfig>('appConfig', ['getActivityUrl']);
    appConfig.getActivityUrl.and.returnValue('someUrl');
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    httpService = jasmine.createSpyObj<HttpService>('httpService', ['get', 'post']);
    httpService.get.and.returnValue(Observable.of(response));
    httpService.post.and.returnValue(Observable.of(response));
    sessionStorageService.getItem.and.returnValue('\"{token: \\\"any\\\"}\"');

    activityService = new ActivityService(httpService, appConfig, sessionStorageService);
  }));

  it('should default to off', () => {
    expect(activityService.mode).toEqual(MODES.off);
  });

   describe('when activity tracking is turned off', () => {
    // It should default to "off" so no need for a beforeEach() here...
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
      activityService.mode = MODES.polling;
    });

    it('should not be enabled', () => {
      expect(activityService.isEnabled).toBeFalsy();
    });
  });

  describe('when an error is returned while verifying the user is authorised', () => {
    const goError = (status: number): void => {
      const error = { status };
      httpService.get.and.returnValue(throwError(error));
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

  xit('should access AppConfig and HttpService for postActivity', () => {
    activityService.postActivity('1111', 'edit');
    expect(httpService.post).toHaveBeenCalled();
    expect(appConfig.getActivityUrl).toHaveBeenCalled();
  });

  xit('should verify user authorization once', () => {
    activityService.verifyUserIsAuthorized();
    activityService.verifyUserIsAuthorized();

    expect(httpService.get).toHaveBeenCalledTimes(1);
    expect(activityService.isEnabled).toBeTruthy();
  });

  xit('should return not enabled when activity url is emty', () => {
    appConfig.getActivityUrl.and.returnValue('');
    activityService['userAuthorised'] = true;

    expect(activityService.isEnabled).toBeFalsy();
  });

  xit('should return enabled when activity url is not emty', () => {
    appConfig.getActivityUrl.and.returnValue('www');
    activityService['userAuthorised'] = true;

    expect(activityService.isEnabled).toBeTruthy();
  });

  xit('should return not enabled when 403', () => {
    const error = {
      status: 403
    };
    httpService.get.and.returnValue(throwError(error));

    activityService.verifyUserIsAuthorized();

    expect(activityService.isEnabled).toBeFalsy();
  });

  xit('should return enabled when error different than 403', () => {
    const error = {
      status: 400
    };
    httpService.get.and.returnValue(throwError(error));

    activityService.verifyUserIsAuthorized();

    expect(activityService.isEnabled).toBeTruthy();
  });

