import { Observable, throwError } from 'rxjs';
import { Response, ResponseOptions } from '@angular/http';
import createSpyObj = jasmine.createSpyObj;
import { DraftService } from './draft.service';
import { AbstractAppConfig } from '../../../app.config';
import { HttpService, HttpErrorService } from '../http';
import { CaseEventData, CaseDetails, Draft, CaseView, HttpError } from '../../domain';

describe('Drafts Service', () => {

  const DATA_URL = 'http://aggregated.ccd.reform';
  const JID = 'TEST';
  const CT_ID = 'TestAddressBookCase';
  const DRAFT_ID = 'Draft1';
  const EVENT_TRIGGER_ID = 'createCase';
  const CREATE_OR_UPDATE_DRAFT_URL = DATA_URL +
    `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CT_ID}/event-trigger/${EVENT_TRIGGER_ID}/drafts/`;
  const GET_OR_DELETE_DRAFT_URL = DATA_URL + `/caseworkers/:uid/jurisdictions/${JID}/case-types/${CT_ID}/drafts/1`;
  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let errorService: any;

  let draftService: DraftService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getCreateOrUpdateDraftsUrl', 'getViewOrDeleteDraftsUrl', 'getCaseDataUrl']);
    appConfig.getCaseDataUrl.and.returnValue(DATA_URL);
    appConfig.getCreateOrUpdateDraftsUrl.and.returnValue(CREATE_OR_UPDATE_DRAFT_URL);
    appConfig.getViewOrDeleteDraftsUrl.and.returnValue(GET_OR_DELETE_DRAFT_URL);

    httpService = createSpyObj<HttpService>('httpService', ['get', 'post', 'put', 'delete']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);

    draftService = new DraftService(httpService, appConfig, errorService);
  });

  describe('saveDraft()', () => {
    const CASE_EVENT_DATA: CaseEventData = {
      event: {
        id: EVENT_TRIGGER_ID,
        summary: 'Short summary',
        description: 'A very nice description'
      },
      event_token: 'test-token',
      ignore_warning: false
    };

    const CASE_DETAILS: CaseDetails = {
      id: 'string',
      jurisdiction: 'Test Jurisdiction',
      case_type_id: 'TestCaseType',
      state: 'State 1',
      case_data: {}
    };

    const DRAFT_RESPONSE: Draft = {
      id: '5',
      document: CASE_DETAILS,
      type: 'Case Details',
      created: '21-06-2018',
      updated: '23-04-2019'
    };

    beforeEach(() => {
      httpService.post.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(DRAFT_RESPONSE)
      }))));
      httpService.put.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(DRAFT_RESPONSE)
      }))));
    });

    it('should create a draft on server', () => {
      let UNDEFINED_DRAFT_ID = undefined;
      draftService
        .createOrUpdateDraft(JID, CT_ID, UNDEFINED_DRAFT_ID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(DRAFT_RESPONSE)
        );
      expect(httpService.post).toHaveBeenCalledWith(CREATE_OR_UPDATE_DRAFT_URL, CASE_EVENT_DATA);
    });

    it('should set error when error is thrown when creating draft', () => {
      httpService.post.and.returnValue(throwError(ERROR));

      draftService.createDraft(JID, CT_ID, CASE_EVENT_DATA)
        .subscribe(data => {
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

    it('should update a draft on server', () => {
      draftService
        .createOrUpdateDraft(JID, CT_ID, DRAFT_ID, CASE_EVENT_DATA)
        .subscribe(
          data => expect(data).toEqual(DRAFT_RESPONSE)
        );
      expect(httpService.put).toHaveBeenCalledWith(CREATE_OR_UPDATE_DRAFT_URL + Draft.stripDraftId(DRAFT_ID), CASE_EVENT_DATA);
    });

    it('should set error when error is thrown when updating draft', () => {
      httpService.put.and.returnValue(throwError(ERROR));

      draftService.updateDraft(JID, CT_ID, DRAFT_ID, CASE_EVENT_DATA)
        .subscribe(data => {
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });

  });

  describe('getDraft()', () => {
    const CASE_VIEW_DATA: CaseView = {
      case_id: '11',
      case_type: {
        id: 'TestAddressBookCase',
        name: 'TestAddressBookCase',
        description: 'some case_type description',
        jurisdiction: {
          id: 'TEST',
          name: 'TEST',
          description: 'some jurisdiction description'
        }
      },
      state: null,
      channels: [],
      tabs: [],
      triggers: [],
      events: []
    };

    beforeEach(() => {
      httpService.get.and.returnValue(Observable.of(new Response(new ResponseOptions({
        body: JSON.stringify(CASE_VIEW_DATA)
      }))));
    });

    it('should get draft on server', () => {
      draftService
        .getDraft(JID, CT_ID, DRAFT_ID)
        .subscribe(
          data => expect(data).toEqual(CASE_VIEW_DATA)
        );
      expect(httpService.get).toHaveBeenCalledWith(GET_OR_DELETE_DRAFT_URL);
    });

    it('should set error when error is thrown when getting draft', () => {
      httpService.get.and.returnValue(throwError(ERROR));
      draftService
        .getDraft(JID, CT_ID, DRAFT_ID)
        .subscribe(data => {
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });

  describe('deleteDraft()', () => {

    beforeEach(() => {
      httpService.delete.and.returnValue(Observable.of(new Response(new ResponseOptions())));
    });

    it('should delete draft on server', () => {
      draftService
        .deleteDraft(JID, CT_ID, DRAFT_ID);

      expect(httpService.delete).toHaveBeenCalledWith(GET_OR_DELETE_DRAFT_URL);
    });

    it('should set error when error is thrown when deleting draft', () => {
      httpService.delete.and.returnValue(throwError(ERROR));
      draftService
        .deleteDraft(JID, CT_ID, DRAFT_ID)
        .subscribe(data => {
        }, err => {
          expect(err).toEqual(ERROR);
          expect(errorService.setError).toHaveBeenCalledWith(ERROR);
        });
    });
  });
});
