import { ProfileService } from './profile.service';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { createAProfile } from '../../domain/profile/profile.test.fixture';
import { Profile } from '../../domain';

describe('ProfileService', () => {

  const MOCK_PROFILE: Profile = createAProfile();

  const API_URL = 'http://aggregated.ccd.reform';
  const PROFILE_URL = API_URL + '/caseworkers/:uid/profile';

  let appConfig: any;
  let httpService: any;

  let profileService: ProfileService;

  describe('get()', () => {

    beforeEach(() => {
      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
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
