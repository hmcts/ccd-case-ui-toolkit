import { Observable } from 'rxjs';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import createSpyObj = jasmine.createSpyObj;
import { BannersService } from './banners.service';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService } from '../http';
import { Banner } from '../../domain';


describe('Banner service', () => {

  const MOCK_BANNER: Banner[] = [{
    bannerDescription: 'test Banner',
    bannerUrlText: 'test',
    bannerUrl: 'banner',
    bannerViewed: true,
    bannerEnabled: true
  }]
  const JID = ['DIVORCE'];
  let params: HttpParams;

  const API_URL = 'http://aggregated.ccd.reform';
  const BANNER_URL = API_URL + '/data/internal/banners/';

  let appConfig: any;
  let httpService: any;

  let bannerService: BannersService;

  describe('Banners()', () => {
    const MOCK_BANNER1 = { banners: MOCK_BANNER }
    
    beforeEach(() => {
      params = new HttpParams();
      
      httpService = createSpyObj<HttpService>('httpService', ['get']);

      appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getBannersUrl', 'getCaseDataUrl']);
      appConfig.getApiUrl.and.returnValue(API_URL);
      appConfig.getCaseDataUrl.and.returnValue(BANNER_URL);
      appConfig.getBannersUrl.and.returnValue(BANNER_URL);

      bannerService = new BannersService(httpService, appConfig);
    });


    describe('getBanners()', () => {

      beforeEach(() => {
        httpService.get.and.returnValue(Observable.of(MOCK_BANNER1));
      });

      it('should use BannerUrl have been called', () => {
        bannerService.getBanners(JID).subscribe();
        expect(appConfig.getBannersUrl).toHaveBeenCalled();
      });

      it('should retrieve banners data', () => {
        bannerService
          .getBanners(JID)
          .subscribe(
            banner => expect(banner).toBe(MOCK_BANNER1.banners)
          );
      });

    });

  });

});




