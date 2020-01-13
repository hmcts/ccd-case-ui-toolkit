import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { Response, ResponseOptions, Headers } from '@angular/http';
import { JurisdictionService } from './jurisdiction.service';
import { JurisdictionConfig } from '../../domain';

describe('JurisdictionService', () => {
  const API_DATA_URL = 'http://data.ccd.reform/aggregated';
  const JurisdictionIds = ['AUTOTEST1', 'AUTOTEST2'];
  const JURISDICTION_UI_CONFIGS_URL = API_DATA_URL + `/internal/jurisdiction-ui-configs`;
  let appConfig: any;
  let httpService: any;
  let jurisdictionService: JurisdictionService;
  let windowService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getCaseDataUrl']);
    appConfig.getCaseDataUrl.and.returnValue(API_DATA_URL);
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    jurisdictionService = new JurisdictionService(httpService, appConfig);
    windowService = appConfig = createSpyObj<any>('windowService', ['setLocalStorage', 'getLocalStorage']);
  });

  describe('getJurisdictionConfigs()', () => {
    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(createJurisdictionConfigs())
      }))));
    });

    it('should use HttpService::get with correct url', () => {
      jurisdictionService
        .getJurisdictionConfigs(JurisdictionIds)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(JURISDICTION_UI_CONFIGS_URL, {
        headers: new Headers({
          'experimental': 'true',
          'Accept': JurisdictionService.V2_MEDIATYPE_JURISDICTION_CONFIGS
        })});
    });

    it('should retrieve jurisdiction UI configs array from server', () => {
      jurisdictionService
        .getJurisdictionConfigs(JurisdictionIds)
        .subscribe(configs => expect(configs).toEqual(createJurisdictionConfigs())
        );
    });

    function createJurisdictionConfigs(): JurisdictionConfig[] {
      return [
        {
          id: 'AUTOTEST1',
          shuttered: true
        },
        {
          id: 'AUTOTEST2',
          shuttered: false
        }
      ];
    }
  }
  );
});
