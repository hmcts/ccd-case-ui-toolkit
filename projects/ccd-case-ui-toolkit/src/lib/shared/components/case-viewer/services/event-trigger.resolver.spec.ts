import createSpyObj = jasmine.createSpyObj;
import { Observable, of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { CaseEventTrigger, HttpError, Profile } from '../../../domain';
import { createAProfile } from '../../../domain/profile/profile.test.fixture';
import { createCaseEventTrigger } from '../../../fixture';
import { ErrorNotifierService, HttpService, LoadingService, ProfileNotifier, ProfileService, SessionStorageService } from '../../../services';
import { CaseResolver } from './case.resolver';
import { EventTriggerResolver } from './event-trigger.resolver';

describe('EventTriggerResolver', () => {
  const IGNORE_WARNING = 'ignoreWarning';
  const IGNORE_WARNING_VALUE = 'false';
  const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;
  const PARAM_EVENT_ID = EventTriggerResolver.PARAM_EVENT_ID;
  const CASE_ID = '42';
  const EVENT_TRIGGER_ID = 'enterCaseIntoLegacy';
  const EVENT_TRIGGER: CaseEventTrigger = createCaseEventTrigger(EVENT_TRIGGER_ID, 'Into legacy', CASE_ID, true, []);
  const EVENT_TRIGGER_OBS: Observable<CaseEventTrigger> = of(EVENT_TRIGGER);
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
  let loadingService: any;
  let sessionStorageService: any;
  let route: any;

  let router: any;
  let profileService: any;
  let profileNotifier: any;
  let errorNotifier: any;
  let appConfig: any;
  let httpService: any;
  const MOCK_PROFILE: Profile = createAProfile();
  const API_URL = 'https://data.ccd.reform';
  const FUNC = () => false;
  const PROFILE: Profile = {
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
    isSolicitor: FUNC,
    isCourtAdmin: FUNC
  };

  const PROFILE_OBS: Observable<Profile> = of(PROFILE);
  const PROFILE_CACHED: Profile = PROFILE;

  beforeEach(() => {
    casesService = createSpyObj('casesService', ['getEventTrigger']);
    alertService = createSpyObj('alertService', ['error', 'setPreserveAlerts']);
    orderService = createSpyObj('orderService', ['sort']);
    loadingService = createSpyObj('loadingService', ['sort']);
    errorNotifier = createSpyObj('errorNotifierService', ['announceError']);
    profileService = createSpyObj<ProfileService>('profileService', ['get']);
    profileNotifier = new ProfileNotifier();
    errorNotifier = new ErrorNotifierService();
    sessionStorageService = createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);

    router = createSpyObj('router', ['navigate']);

    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getApiUrl', 'getCaseDataUrl']);
    appConfig.getApiUrl.and.returnValue(API_URL);
    appConfig.getCaseDataUrl.and.returnValue(API_URL);
    httpService = createSpyObj<HttpService>('httpService', ['get']);
    httpService.get.and.returnValue(of(MOCK_PROFILE));

    eventTriggerResolver = new EventTriggerResolver(casesService, alertService, profileService, profileNotifier, router, appConfig, errorNotifier, loadingService, sessionStorageService);

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
      // tslint:disable-next-line:switch-default
      switch (key) {
        case PARAM_EVENT_ID:
          return EVENT_TRIGGER_ID;
      }
    });

    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return 'PRIVATELAW';
        case 'caseType':
          return 'PRLAPPS';
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });

    route.queryParamMap.get.and.callFake(key => {
      // tslint:disable-next-line:switch-default
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
    expect(route.paramMap.get).toHaveBeenCalledTimes(3);
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
    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return 'PRIVATELAW';
        case 'caseType':
          return 'PRLAPPS';
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
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
    expect(route.paramMap.get).toHaveBeenCalledTimes(3);
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
      },
      params: {
        eid: EVENT_TRIGGER_ID,
        cid: '42'
      }
    };
    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return 'PRIVATELAW';
        case 'caseType':
          return 'PRLAPPS';
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
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
    casesService.getEventTrigger.and.returnValue(throwError(ERROR));
    profileService.get.and.returnValue(PROFILE_OBS);

    eventTriggerResolver
      .resolve(route)
      .then(data => {
        fail(data);
      }, err => {
      err.details = { eventId: 'createBundle', ...err.details };
       expect(err).toBeTruthy();
       expect(alertService.setPreserveAlerts).toHaveBeenCalledWith(true);
       expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
       expect(router.navigate).toHaveBeenCalledWith([`/cases/case-details/PRIVATELAW/PRLAPPS/${CASE_ID}`], { fragment: 'Tasks' });
        done();
      });
    expect(profileService.get).toHaveBeenCalledWith();
  });

  it('should not navigate to tasks on error if url is present', done => {
    casesService.getEventTrigger.and.returnValue(throwError(ERROR));
    profileService.get.and.returnValue(PROFILE_OBS);
    router.url = '/cases/case-details/';

    eventTriggerResolver
      .resolve(route)
      .then(data => {
        fail(data);
      }, err => {
      err.details = { eventId: 'createBundle', ...err.details };
       expect(err).toBeTruthy();
       expect(alertService.setPreserveAlerts).toHaveBeenCalledWith(true);
       expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
       expect(router.navigate).not.toHaveBeenCalledWith([`/cases/case-details/${CASE_ID}`], { fragment: 'Tasks' });
        done();
      });
    expect(profileService.get).toHaveBeenCalledWith();
  });


  it('should return cached profile without making API call', () => {
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    eventTriggerResolver['cachedProfile'] = PROFILE_CACHED;
    profileService.get.and.returnValue(PROFILE_OBS);

    eventTriggerResolver
      .resolve(route)
      .then(caseData => {
        expect(caseData).toEqual(EVENT_TRIGGER);
      });

    expect(profileService.get).not.toHaveBeenCalledWith();
    expect(casesService.getEventTrigger).toHaveBeenCalled();
    expect(eventTriggerResolver['cachedProfile']).toBe(PROFILE);
  });

  it('should make Profile API call and cached profile', () => {
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    profileService.get.and.returnValue(PROFILE_OBS);

    eventTriggerResolver
      .resolve(route)
      .then(caseData => {
        expect(caseData).toEqual(EVENT_TRIGGER);
      });

    expect(profileService.get).toHaveBeenCalledWith();
    expect(casesService.getEventTrigger).toHaveBeenCalled();
    expect(eventTriggerResolver['cachedProfile']).toBe(PROFILE);
  });

  it('should redirect and return null if jurisdiction or caseType are missing and caseInfo is incomplete', async () => {
    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return null;
        case 'caseType':
          return null;
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
    route.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return null;
        case 'caseType':
          return null;
        case PARAM_EVENT_ID:
          return EVENT_TRIGGER_ID;
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
    sessionStorageService.getItem.and.returnValue('{}');
    eventTriggerResolver
      .resolve(route)
      .then(result => {
        expect(result).toBeNull();
        expect(alertService.error).toHaveBeenCalledWith({ phrase: 'Cannot determine jurisdiction and case type' });
        expect(router.navigate).toHaveBeenCalledWith([router.url]);
      });
  });

  it('should redirect to correct URL if jurisdiction or caseType are missing but caseInfo is present', async () => {
    const caseInfo = {
      jurisdiction: 'testJurisdiction',
      caseType: 'testCaseType',
      caseId: CASE_ID
    };
    route.parent.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return null;
        case 'caseType':
          return null;
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
    route.paramMap.get.and.callFake(key => {
      switch (key) {
        case 'jurisdiction':
          return null;
        case 'caseType':
          return null;
        case PARAM_EVENT_ID:
          return EVENT_TRIGGER_ID;
        case PARAM_CASE_ID:
          return CASE_ID;
      }
    });
    route.queryParams = { foo: 'bar' };
    sessionStorageService.getItem.and.returnValue(JSON.stringify(caseInfo));
    eventTriggerResolver
      .resolve(route)
      .then(result => {
        expect(result).toBeNull();
        expect(router.navigate).toHaveBeenCalledWith([
          '/cases/case-details',
          caseInfo.jurisdiction,
          caseInfo.caseType,
          CASE_ID,
          'trigger',
          EVENT_TRIGGER_ID
        ], { queryParams: { foo: 'bar' } });
      });
  });

  it('should reset cached event trigger', () => {
    eventTriggerResolver['cachedEventTrigger'] = EVENT_TRIGGER;
    eventTriggerResolver.resetCachedEventTrigger();
    expect(eventTriggerResolver['cachedEventTrigger']).toBeNull();
  });

  it('should set ignoreWarning to false if not valid value', async () => {
    route.queryParamMap.get.and.returnValue('invalid');
    casesService.getEventTrigger.and.callFake((caseTypeId, eventTriggerId, cid, ignoreWarning) => {
      expect(ignoreWarning).toBe('false');
      return EVENT_TRIGGER_OBS;
    });
    profileService.get.and.returnValue(PROFILE_OBS);
    await eventTriggerResolver.resolve(route);
  });

  it('should call profileNotifier.announceProfile with cachedProfile', async () => {
    eventTriggerResolver['cachedProfile'] = PROFILE;
    spyOn(profileNotifier, 'announceProfile');
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    await eventTriggerResolver.resolve(route);
    expect(profileNotifier.announceProfile).toHaveBeenCalledWith(PROFILE);
  });

  it('should call profileNotifier.announceProfile after profileService.get', async () => {
    eventTriggerResolver['cachedProfile'] = undefined;
    spyOn(profileNotifier, 'announceProfile');
    profileService.get.and.returnValue(of(PROFILE));
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    await eventTriggerResolver.resolve(route);
    expect(profileNotifier.announceProfile).toHaveBeenCalledWith(PROFILE);
  });

  it('should handle error in getAndCacheEventTrigger and propagate error', async () => {
    casesService.getEventTrigger.and.returnValue(throwError(ERROR));
    profileService.get.and.returnValue(PROFILE_OBS);
    spyOn(errorNotifier, 'announceError');
    try {
      await eventTriggerResolver.resolve(route);
      fail('Should throw');
    } catch (err) {
      expect(alertService.setPreserveAlerts).toHaveBeenCalledWith(true);
      expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
      expect(errorNotifier.announceError).toHaveBeenCalledWith(jasmine.objectContaining({ message: ERROR.message }));
      expect(router.navigate).toHaveBeenCalled();
    }
  });
});
