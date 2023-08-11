import { HttpHeaders } from '@angular/common/http';
import { waitForAsync } from '@angular/core/testing';
import { of } from 'rxjs';
import { AbstractAppConfig as AppConfig } from '../../../app.config';
import { WorkbasketInput, WorkbasketInputModel } from '../../domain/workbasket/workbasket-input.model';
import { HttpService } from '../http/http.service';
import { WorkbasketInputFilterService } from './workbasket-input-filter.service';
import createSpyObj = jasmine.createSpyObj;

describe('WorkbasketInputFilterService', () => {
  const API_DATA_URL = 'http://data.ccd.reform/aggregated';
  const JURISDICTION_ID = 'PROBATE';
  const CASE_TYPE_ID = 'TestAddressBookCase';
  const CASE_TYPES_URL = `${API_DATA_URL}/internal/case-types/${CASE_TYPE_ID}/work-basket-inputs`;
  let appConfig: any;
  let httpService: any;
  let workbasketInputFilterService: WorkbasketInputFilterService;
  let windowService;

  beforeEach(() => {
    appConfig = createSpyObj<AppConfig>('appConfig', ['getCaseDataUrl']);
    appConfig.getCaseDataUrl.and.returnValue(API_DATA_URL);
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    workbasketInputFilterService = new WorkbasketInputFilterService(httpService, appConfig);
    windowService = appConfig = createSpyObj<any>('windowService', ['setLocalStorage', 'getLocalStorage']);
  });

  describe('getWorkbasketInputs()', () => {
    beforeEach(waitForAsync(() => {
      httpService.get.and.returnValue(of(jsonResponse()));
    }));

    it('should use HttpService::get with correct url', waitForAsync(() => {
      workbasketInputFilterService
        .getWorkbasketInputs(JURISDICTION_ID, CASE_TYPE_ID)
        .subscribe()
        .add(() => {
          expect(httpService.get).toHaveBeenCalledWith(CASE_TYPES_URL, {
            headers: new HttpHeaders()
              .set('experimental', 'true')
              .set('Accept', WorkbasketInputFilterService.V2_MEDIATYPE_WORKBASKET_INPUT_DETAILS)
              .set('Content-Type', 'application/json'),
            observe: 'body'
          });
        });
    }));

    it('should retrieve workbasketInput array from server', waitForAsync(() => {
      workbasketInputFilterService
        .getWorkbasketInputs(JURISDICTION_ID, CASE_TYPE_ID)
        .subscribe(workbasketInputs => {
          expect(workbasketInputs).toEqual(createWorkbasketInputs());
        });
    }));

    function jsonResponse(): WorkbasketInput {
      return { workbasketInputs: createWorkbasketInputs()};
    }

    function createWorkbasketInputs(): WorkbasketInputModel[] {
      return [
        {
          label: 'Field 1',
          field: {
            id: 'field1', field_type: { id: 'Text', type: 'Text' }, value: '', label: 'Field 1'
          },
          order: 1
        },
        {
          label: 'Field 2',
          field: {
            id: 'field2', field_type: { id: 'Text', type: 'Text' }, value: 'Some Value', label: 'Field 2'
          },
          order: 2
        },
        {
          label: 'Field 3',
          field: {
            id: 'field3', field_type: { id: 'Text', type: 'Text' }, value: '', label: 'Field 3'
          },
          order: 3
        }
      ];
    }
  }
  );
});
