import { CaseResolver } from './case.resolver';
import { NavigationEnd } from '@angular/router';
import { Observable } from 'rxjs';
import { CaseView } from '../../../domain';
import { AlertService, DraftService, NavigationNotifierService, NavigationOrigin } from '../../../services';
import createSpyObj = jasmine.createSpyObj;

describe('CaseResolver', () => {
  describe('resolve()', () => {

    const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;

    const CASE_ID = '42';
    const CASE: CaseView = new CaseView();
    CASE.case_id = 'CASE_ID_1';

    const CASE_CACHED: CaseView = new CaseView();
    CASE_CACHED.case_id = 'CACHED_CASE_ID_1';
    const CASE_OBS: Observable<CaseView> = Observable.of(CASE);

    let caseResolver: CaseResolver;
    let draftService: DraftService;
    let casesService: any;
    let caseNotifier: any;
    let alertService: AlertService;
    let navigationNotifierService: NavigationNotifierService;
    let route: any;

    let router: any;

    beforeEach(() => {
      router = {
        navigate: jasmine.createSpy('navigate'),
        events: Observable.of( new NavigationEnd(0, '/case', '/home'))
    };
      caseNotifier = createSpyObj('caseNotifier', ['announceCase']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);
      alertService = createSpyObj('alertService', ['success']);
      navigationNotifierService = new NavigationNotifierService();
      spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
      caseResolver = new CaseResolver(caseNotifier, casesService, draftService, navigationNotifierService, router, alertService);

      route = {
        firstChild: {
          url: []
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);
    });

    it('should resolve case and cache when the route is the one for case view', () => {
      caseResolver['cachedCaseView'] = CASE_CACHED;
      casesService.getCaseViewV2.and.returnValue(CASE_OBS);

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(CASE);
        });

      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toEqual(CASE);
    });

    it('should return cached case view when the route is a case view tab and cached view exists', () => {
      caseResolver['cachedCaseView'] = CASE_CACHED;
      casesService.getCaseViewV2.and.returnValue(CASE_OBS);
      route = {
        firstChild: {
          url: [],
          fragment: 'someFragment'
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toBe(CASE_CACHED);
        });
      expect(casesService.getCaseViewV2).not.toHaveBeenCalled();
      expect(caseResolver['cachedCaseView']).toBe(CASE_CACHED);
    });

    it('should return retrieve case view when the route is a case view tab but empty cache', () => {
      caseResolver['cachedCaseView'] = null;
      casesService.getCaseViewV2.and.returnValue(CASE_OBS);
      route = {
        firstChild: {
          url: [],
          fragment: 'someFragment'
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(CASE);
        });

      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toEqual(CASE);
    });

    it('should return cached case view when the route is not the one for case view and cached view exists', () => {
      caseResolver['cachedCaseView'] = CASE_CACHED;
      casesService.getCaseViewV2.and.returnValue(CASE_OBS);
      route = {
        firstChild: {
          url: ['someUrlSegment']
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toBe(CASE_CACHED);
        });
      expect(casesService.getCaseViewV2).not.toHaveBeenCalled();
      expect(caseResolver['cachedCaseView']).toEqual(CASE_CACHED);
    });

    it('should retrieve case view when the route is not the one for case view and cached is empty', () => {
      caseResolver['cachedCaseView'] = null;
      casesService.getCaseViewV2.and.returnValue(CASE_OBS);
      route = {
        firstChild: {
          url: ['someUrlSegment']
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(CASE);
        });

      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toEqual(CASE);
    });

    it('should redirect to error page when case cannot be retrieved', () => {
      casesService.getCaseViewV2.and.returnValue(Observable.throw('Failed'));

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/error']);
    });

    it('should redirect to case list page when case cannot be found and previousUrl is event submission', () => {
      const error = {
        status: 404
      };
      casesService.getCaseViewV2.and.returnValue(Observable.throw(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: Observable.of( new NavigationEnd(0, '/trigger/COMPLETE/submit', '/home'))
      };

      caseResolver = new CaseResolver(caseNotifier, casesService, draftService, navigationNotifierService, router, alertService);

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/list/case']);
    });

    it('should not redirect to case list page when case cannot be found and previousUrl is not matching event submission', () => {
      const error = {
        status: 404
      };
      casesService.getCaseViewV2.and.returnValue(Observable.throw(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: Observable.of( new NavigationEnd(0, '/trigger/COMPLETE/process', '/home'))
      };

      caseResolver = new CaseResolver(caseNotifier, casesService, draftService, navigationNotifierService, router, alertService);

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).not.toHaveBeenCalledWith(['/list/case']);
    });

    it('should redirect to case list page when case id is empty', () => {
      let navigationResult = Promise.resolve('someResult');
      router.navigate.and.returnValue(navigationResult);
      route.paramMap.get.and.returnValue('');

      caseResolver.resolve(route);

      expect(navigationNotifierService.announceNavigation).toHaveBeenCalledWith({action: NavigationOrigin.NO_READ_ACCESS_REDIRECTION});

      navigationResult.then(() => {
        expect(alertService.success).toHaveBeenCalledWith(CaseResolver.CASE_CREATED_MSG);
      });
    });
  });

  describe('resolve()', () => {

    const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;

    const DRAFT_ID = 'DRAFT42';
    const DRAFT: CaseView = new CaseView();
    DRAFT.case_id = 'DRAFT_CASE_ID_1';

    const DRAFT_CACHED: CaseView = new CaseView();
    DRAFT_CACHED.case_id = 'DRAFT_CASE_CACHED_ID_1';
    const DRAFT_OBS: Observable<CaseView> = Observable.of(DRAFT);

    let caseResolver: CaseResolver;
    let draftService: any;

    let caseNotifier: any;
    let casesService: any;
    let alertService: AlertService;
    let navigationNotifierService: NavigationNotifierService;
    let route: any;

    let router: any;

    beforeEach(() => {
      router = {
        navigate: jasmine.createSpy('navigate'),
        events: Observable.of( new NavigationEnd(0, '/case', '/home'))
      };
      caseNotifier = createSpyObj('caseNotifier', ['announceCase']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);
      draftService.getDraft.and.returnValue(DRAFT_OBS);
      alertService = createSpyObj('alertService', ['success']);
      navigationNotifierService = createSpyObj('navigationNotifierService', ['announceNavigation']);
      caseResolver = new CaseResolver(caseNotifier, casesService, draftService, navigationNotifierService, router, alertService);

      route = {
        firstChild: {
          url: []
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(DRAFT_ID);
    });

    it('should resolve draft and cache when the route is the one for case DRAFT', () => {
      caseResolver['cachedCaseView'] = DRAFT_CACHED;

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(DRAFT);
        });

      expect(draftService.getDraft).toHaveBeenCalledWith(DRAFT_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toEqual(DRAFT);
    });
  });
});
