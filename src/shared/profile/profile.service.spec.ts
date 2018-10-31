import { ProfileService } from './profile.service';
import { AppConfig } from '../../app.config';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import { createAProfile } from './profile.test.fixture';
import { HttpService, Profile } from '@hmcts/ccd-case-ui-toolkit';

describe('ProfileService', () => {

  const MOCK_PROFILE: Profile = createAProfile();

  const API_URL = 'http://aggregated.ccd.reform';
  const PROFILE_URL = API_URL + '/caseworkers/:uid/profile';

  let appConfig: any;
  let httpService: any;

  let profileService: ProfileService;

  describe('get()', () => {

    beforeEach(() => {
      appConfig = createSpyObj<AppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(API_URL);

      httpService = createSpyObj<HttpService>('httpService', ['get']);
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(MOCK_PROFILE)
      }))));

      profileService = new ProfileService(httpService, appConfig);
    });

    it('should use HttpService::get with correct url', () => {
      profileService
        .get()
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(PROFILE_URL);
    });

    it('should retrieve profile from server', () => {
      profileService
        .get()
        .subscribe(
          profile => expect(profile).toEqual(MOCK_PROFILE)
        );
    });

  });
});
