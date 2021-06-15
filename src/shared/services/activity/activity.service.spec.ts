
import { ActivityService } from './activity.service';
import { AbstractAppConfig } from '../../../';
import { Observable } from 'rxjs';
import { HttpService } from '../../services/http';
import { SessionStorageService } from '../session/session-storage.service';

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

  it('should return not enabled when activity url is emty', () => {
    appConfig.getActivityUrl.and.returnValue('');
    activityService['userAuthorised'] = true;

    expect(activityService.isEnabled).toBeFalsy();
  });

  it('should return enabled when activity url is not emty', () => {
    appConfig.getActivityUrl.and.returnValue('www');
    activityService['userAuthorised'] = true;

    expect(activityService.isEnabled).toBeTruthy();
  });

  it('should return not enabled when 403', () => {
    const error = {
      status: 403
    };
    httpService.get.and.returnValue(Observable.throw(error));

    activityService.verifyUserIsAuthorized();

    expect(activityService.isEnabled).toBeFalsy();
  });

  it('should return enabled when error different than 403', () => {
    const error = {
      status: 400
    };
    httpService.get.and.returnValue(Observable.throw(error));

    activityService.verifyUserIsAuthorized();

    expect(activityService.isEnabled).toBeTruthy();
  });
});
