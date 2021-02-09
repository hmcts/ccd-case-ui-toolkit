import { ProfileService } from './profile.service';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { createAProfile } from '../../domain/profile/profile.test.fixture';
import { Profile } from '../../domain';
import { HttpHeaders, HttpResponse } from '@angular/common/http';

describe('ProfileService', () => {

  const MOCK_PROFILE: Profile = createAProfile();

  const API_URL = 'http://data.ccd.reform';
  const PROFILE_URL = API_URL + '/internal/profile';

  let appConfig: any;
  let httpService: any;

  let profileService: ProfileService;

  describe('get()', () => {

    beforeEach(() => {
      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(API_URL);

      httpService = createSpyObj<HttpService>('httpService', ['get']);
      httpService.get.and.returnValue(Observable.of(new HttpResponse({
        body: JSON.stringify(MOCK_PROFILE)
      })));

      profileService = new ProfileService(httpService, appConfig);
    });

    it('should use HttpService::get with correct url', () => {
      profileService
        .get()
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(PROFILE_URL, {
        headers: new HttpHeaders({
          'experimental': 'true',
          'Accept': ProfileService.V2_MEDIATYPE_USER_PROFILE
        })});
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
