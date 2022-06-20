import { EventTriggerResolver } from './event-trigger.resolver';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { CaseResolver } from './case.resolver';
import { CaseEventTrigger, HttpError, CaseView, Profile } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture';
import { HttpService, ProfileNotifier, ProfileService } from '../../../services';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { AbstractAppConfig } from '../../../../app.config';

describe('EventTriggerResolver', () => {

  const IGNORE_WARNING = 'ignoreWarning';
  const IGNORE_WARNING_VALUE = 'false';
  const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;
  const PARAM_EVENT_ID = EventTriggerResolver.PARAM_EVENT_ID;
  const CASE_ID = '42';
  const EVENT_TRIGGER_ID = 'enterCaseIntoLegacy';
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(EVENT_TRIGGER_ID, 'Into legacy', CASE_ID, true, []);
  const EVENT_TRIGGER_OBS: Observable<CaseEventTrigger> = Observable.of(EVENT_TRIGGER);
  const ERROR: HttpError = {
    timestamp: '',
    status: 422,
    message: 'Validation failed',
    error: '',
    exception: '',
    path: ''
  };

  let eventTriggerResolver: EventTriggerResolver;

  let casesService: any;
  let alertService: any;
  let orderService: any;

  let route: any;

  let router: any;
  let profileService: any;
  let profileNotifier: any;
  let appConfig: any;
  let httpService: any;
  const MOCK_PROFILE: Profile = createAProfile();
  const API_URL = 'https://data.ccd.reform';
  let FUNC = () => false;
  let PROFILE: Profile = {
    user: {
      idam: {
        id: 'user1',
      email: 'test@mail.com',
      forename: 'first',
      surname: 'last',
      roles: ['caseworker', 'caseworker-test', 'caseworker-probate-solicitor']
      }
    },
    channels: [],
    jurisdictions: [],
    default: {
      workbasket: {
        case_type_id: '',
        jurisdiction_id: '',
        state_id: ''
      }
    },
    'isSolicitor': FUNC,
    'isCourtAdmin': FUNC
  };

  let PROFILE_OBS: Observable<Profile> = Observable.of(PROFILE);

  beforeEach(() => {
    casesService = createSpyObj('casesService', ['getEventTrigger']);
    alertService = createSpyObj('alertService', ['error']);
    orderService = createSpyObj('orderService', ['sort']);
    profileService = createSpyObj<ProfileService>('profileService', ['get']);
    profileNotifier = new ProfileNotifier();

    router = createSpyObj('router', ['navigate']);

    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
    appConfig.getApiUrl.and.returnValue(API_URL);
    appConfig.getCaseDataUrl.and.returnValue(API_URL);
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    httpService.get.and.returnValue(Observable.of(MOCK_PROFILE));

    eventTriggerResolver = new EventTriggerResolver(casesService, alertService, profileService, profileNotifier);

    route = {
      firstChild: {
          url: []
        },
      queryParamMap : createSpyObj('queryParamMap', ['get']),
      paramMap: createSpyObj('paramMap', ['get']),
      parent: {
        paramMap: createSpyObj('paramMap', ['get']),
      }
    };

    route.paramMap.get.and.callFake(key => {
      switch (key) {
        case PARAM_EVENT_ID:
          return EVENT_TRIGGER_ID;
      }
    });

    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });

    route.queryParamMap.get.and.callFake(key => {
      switch (key) {
        case IGNORE_WARNING:
          return false;
      }
    });
  });

  it('should resolve event trigger and cache when route is trigger/:eid', () => {
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    expect(eventTriggerResolver['cachedEventTrigger']).toBeUndefined();

    profileService.get.and.returnValue(PROFILE_OBS);
    eventTriggerResolver
      .resolve(route)
      .then(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

    expect(profileService.get).toHaveBeenCalledWith();
    expect(casesService.getEventTrigger).toHaveBeenCalledWith(undefined, EVENT_TRIGGER_ID, CASE_ID, IGNORE_WARNING_VALUE);
    expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_EVENT_ID);
    expect(route.paramMap.get).toHaveBeenCalledTimes(1);
    expect(eventTriggerResolver['cachedEventTrigger']).toBe(EVENT_TRIGGER);
  });

  it('should resolve event trigger when route is not trigger/:eid but cache is empty', () => {
    route = {
      firstChild: {
          url: ['someChild']
        },
      queryParamMap : createSpyObj('queryParamMap', ['get']),
      paramMap: createSpyObj('paramMap', ['get']),
      parent: {
        paramMap: createSpyObj('paramMap', ['get']),
      }
    };
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    expect(eventTriggerResolver['cachedEventTrigger']).toBeUndefined();
    profileService.get.and.returnValue(PROFILE_OBS);
    eventTriggerResolver
      .resolve(route)
      .then(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

    expect(profileService.get).toHaveBeenCalledWith();
    expect(casesService.getEventTrigger).toHaveBeenCalled();
    expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_EVENT_ID);
    expect(route.paramMap.get).toHaveBeenCalledTimes(1);
    expect(eventTriggerResolver['cachedEventTrigger']).toBe(EVENT_TRIGGER);
  });

  it('should return cached event trigger when route is not trigger/:eid if cache is not empty', () => {
    route = {
      firstChild: {
          url: ['someChild']
        },
      queryParamMap : createSpyObj('queryParamMap', ['get']),
      paramMap: createSpyObj('paramMap', ['get']),
      parent: {
        paramMap: createSpyObj('paramMap', ['get'])
      }
    };
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    eventTriggerResolver['cachedEventTrigger'] = EVENT_TRIGGER;
    profileService.get.and.returnValue(PROFILE_OBS);
    eventTriggerResolver
      .resolve(route)
      .then(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

    expect(profileService.get).not.toHaveBeenCalledWith();
    expect(casesService.getEventTrigger).not.toHaveBeenCalled();
    expect(eventTriggerResolver['cachedEventTrigger']).toBe(EVENT_TRIGGER);
  });

  it('should create error alert when event trigger cannot be retrieved', done => {
    casesService.getEventTrigger.and.returnValue(Observable.throw(ERROR));
    profileService.get.and.returnValue(PROFILE_OBS);

    eventTriggerResolver
      .resolve(route)
      .then(data => {
        fail(data);
      }, err => {
        expect(err).toBeTruthy();
        expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
        done();
      });
    expect(profileService.get).toHaveBeenCalledWith();
  });
});
