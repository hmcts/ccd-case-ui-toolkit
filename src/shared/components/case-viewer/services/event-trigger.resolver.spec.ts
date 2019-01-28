import { EventTriggerResolver } from './event-trigger.resolver';
import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { CaseResolver } from './case.resolver';
import { CaseEventTrigger, HttpError, CaseView } from '../../../domain';
import { createCaseEventTrigger } from '../../../fixture';

describe('EventTriggerResolver', () => {

  const IGNORE_WARNING = 'ignoreWarning';
  const IGNORE_WARNING_VALUE = 'false';
  const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;
  const PARAM_EVENT_ID = EventTriggerResolver.PARAM_EVENT_ID;
  const JURISDICTION = 'TEST';
  const CASE_TYPE = 'TestAddressBookCase';
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
  const CASE: CaseView = {
    case_id: CASE_ID,
    case_type: {
      id: CASE_TYPE,
      name: '',
      jurisdiction: {
        id: JURISDICTION,
        name: ''
      }
    },
    state: null,
    channels: null,
    tabs: null,
    triggers: null,
    events: null
  };

  let eventTriggerResolver: EventTriggerResolver;

  let casesService: any;
  let alertService: any;
  let orderService: any;

  let route: any;

  let router: any;

  beforeEach(() => {
    casesService = createSpyObj('casesService', ['getEventTrigger']);
    alertService = createSpyObj('alertService', ['error']);
    orderService = createSpyObj('orderService', ['sort']);

    router = createSpyObj('router', ['navigate']);

    eventTriggerResolver = new EventTriggerResolver(casesService, alertService);

    route = {
      firstChild: {
          url: []
        },
      queryParamMap : createSpyObj('queryParamMap', ['get']),
      paramMap: createSpyObj('paramMap', ['get']),
      parent: {
        data: {
          case: CASE
        }
      }
    };

    route.paramMap.get.and.callFake(key => {
      switch (key) {
        case PARAM_CASE_ID:
          return CASE_ID;
        case PARAM_EVENT_ID:
          return EVENT_TRIGGER_ID;
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

    eventTriggerResolver
      .resolve(route)
      .subscribe(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

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
        data: {
          case: CASE
        }
      }
    };
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    expect(eventTriggerResolver['cachedEventTrigger']).toBeUndefined();

    eventTriggerResolver
      .resolve(route)
      .subscribe(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

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
        data: {
          case: CASE
        }
      }
    };
    casesService.getEventTrigger.and.returnValue(EVENT_TRIGGER_OBS);
    eventTriggerResolver['cachedEventTrigger'] = EVENT_TRIGGER;

    eventTriggerResolver
      .resolve(route)
      .subscribe(triggerData => {
        expect(triggerData).toBe(EVENT_TRIGGER);
      });

    expect(casesService.getEventTrigger).not.toHaveBeenCalled();
    expect(eventTriggerResolver['cachedEventTrigger']).toBe(EVENT_TRIGGER);
  });

  it('should create error alert when event trigger cannot be retrieved', done => {
    casesService.getEventTrigger.and.returnValue(Observable.throw(ERROR));

    eventTriggerResolver
      .resolve(route)
      .subscribe(data => {
        fail(data);
      }, err => {
        expect(err).toBeTruthy();
        expect(alertService.error).toHaveBeenCalledWith(ERROR.message);
        done();
      });
  });
});
