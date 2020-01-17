import createSpyObj = jasmine.createSpyObj;
import any = jasmine.any;
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { HttpService } from '../http/http.service';
import { Observable } from 'rxjs';
import { Response, ResponseOptions, Headers } from '@angular/http';
import { JurisdictionService } from './jurisdiction.service';
import { JurisdictionUIConfig } from '../../domain';

describe('JurisdictionService', () => {
  const API_DATA_URL = 'http://data.ccd.reform/aggregated';
  const JurisdictionIds = ['AUTOTEST1', 'AUTOTEST2'];
  const JURISDICTION_UI_CONFIGS_URL = API_DATA_URL + `/internal/jurisdiction-ui-configs`;
  let appConfig: any;
  let httpService: any;
  let jurisdictionService: JurisdictionService;
  let windowService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getJurisdictionUiConfigsUrl']);
    appConfig.getJurisdictionUiConfigsUrl.and.returnValue(JURISDICTION_UI_CONFIGS_URL);
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    jurisdictionService = new JurisdictionService(httpService, appConfig);
    windowService = appConfig = createSpyObj<any>('windowService', ['setLocalStorage', 'getLocalStorage']);
  });

  describe('getJurisdictionUIConfigs()', () => {
    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: { configs: createJurisdictionConfigs() }
      }))));
    });

    it('should use HttpService::get with correct url', () => {
      jurisdictionService
        .getJurisdictionUIConfigs(JurisdictionIds)
        .subscribe();

      expect(httpService.get).toHaveBeenCalledWith(JURISDICTION_UI_CONFIGS_URL, any(Object));
    });

    it('should retrieve jurisdiction UI configs array from server', () => {
      jurisdictionService.getJurisdictionUIConfigs(JurisdictionIds).subscribe(result => {
        expect(result).toEqual(createJurisdictionConfigs());
      });
    });

    function createJurisdictionConfigs(): JurisdictionUIConfig[] {
      return [
        {
          id: 'AUTOTEST1',
          shuttered: true,
          name: 'Auto Test1'
        },
        {
          id: 'AUTOTEST2',
          shuttered: false,
          name: 'Auto Test2'
        }
      ];
    }
  }
  );

  describe('isShuttered()', () => {
    it('should be false when no configs available', () => {
      const noOfJurisdictions = 1;
      const jurisdictionUiConfigs = [];

      const result = jurisdictionService.isShuttered(jurisdictionUiConfigs, noOfJurisdictions);

      expect(result).toBeFalsy();
    });

    it('should be true when all jurisdictions are shuttered', () => {
      const noOfJurisdictions = 2;
      const jurisdictionUiConfigs = [
        createJurisdictionConfig('AUTOTEST1', true),
        createJurisdictionConfig('AUTOTEST2', true)
      ];

      const result = jurisdictionService.isShuttered(jurisdictionUiConfigs, noOfJurisdictions);

      expect(result).toBeTruthy();
    });

    it('should be false when at least one jurisdiction is not shuttered', () => {
      const noOfJurisdictions = 3;
      const jurisdictionUiConfigs = [
        createJurisdictionConfig('AUTOTEST1', true),
        createJurisdictionConfig('AUTOTEST2', true),
        createJurisdictionConfig('AUTOTEST3', false)
      ];

      const result = jurisdictionService.isShuttered(jurisdictionUiConfigs, noOfJurisdictions);

      expect(result).toBeFalsy();
    });

    it('should be false when not all jurisdictions have a config yet', () => {
      const noOfJurisdictions = 2;
      const jurisdictionUiConfigs = [
        createJurisdictionConfig('AUTOTEST1', true)
      ];

      const result = jurisdictionService.isShuttered(jurisdictionUiConfigs, noOfJurisdictions);

      expect(result).toBeFalsy();
    });

    function createJurisdictionConfig(id: string, shuttered: boolean): JurisdictionUIConfig {
      return createJurisdictionConfigObj(id, shuttered, id);
    }

    function createJurisdictionConfigObj(id: string, shuttered: boolean, name: string): JurisdictionUIConfig {
      return { id, shuttered, name};
    }
  }
  );
});
