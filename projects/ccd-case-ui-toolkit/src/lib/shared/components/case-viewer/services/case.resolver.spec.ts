import { CaseResolver } from './case.resolver';
import { NavigationEnd } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
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
    const CASE_OBS: Observable<CaseView> = of(CASE);

    let caseResolver: CaseResolver;
    let draftService: DraftService;
    let casesService: any;
    let caseNotifier: any;
    let navigationNotifierService: NavigationNotifierService;
    let sessionStorageService: any;
    let route: any;

    let router: any;

    beforeEach(() => {
      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/case', '/home'))
    };
      caseNotifier = createSpyObj('caseNotifier', ['announceCase', 'fetchAndRefresh']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);
      sessionStorageService = createSpyObj('sessionStorageService', ['getItem']);
      navigationNotifierService = new NavigationNotifierService();
      spyOn(navigationNotifierService, 'announceNavigation').and.callThrough();
      caseNotifier.fetchAndRefresh.and.returnValue(of(CASE));
      sessionStorageService.getItem.and.returnValue(null);
      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

      route = {
        firstChild: {
          url: []
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(CASE_ID);
    });

    it('should resolve case and cache when the route is the one for case view', () => {
      caseNotifier.cachedCaseView = CASE;

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(CASE);
        });

      expect(caseNotifier.fetchAndRefresh).toHaveBeenCalledWith(CASE_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseNotifier.cachedCaseView).toEqual(CASE);
    });

    it('should return cached case view when the route is a case view tab and cached view exists', () => {
      caseNotifier.cachedCaseView = CASE_CACHED;
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
      expect(caseNotifier.fetchAndRefresh).not.toHaveBeenCalled();
      expect(caseNotifier.cachedCaseView).toBe(CASE_CACHED);
    });

    it('should return retrieve case view when the route is a case view tab but empty cache', () => {
      caseNotifier.cachedCaseView = null;
      caseNotifier.fetchAndRefresh.and.returnValue(CASE_OBS);
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

      expect(caseNotifier.fetchAndRefresh).toHaveBeenCalledWith(CASE_ID);
    });

    it('should return cached case view when the route is not the one for case view and cached view exists', () => {
      caseNotifier.cachedCaseView = CASE_CACHED;
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
      expect(caseNotifier.fetchAndRefresh).not.toHaveBeenCalled();
      expect(caseNotifier.cachedCaseView).toEqual(CASE_CACHED);
    });

    it('should retrieve case view when the route is not the one for case view and cached is empty', () => {
      caseNotifier.cachedCaseView = null;
      caseNotifier.fetchAndRefresh.and.returnValue(CASE_OBS);
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

      expect(caseNotifier.fetchAndRefresh).toHaveBeenCalledWith(CASE_ID);
    });

    it('should redirect to error page when case cannot be retrieved', () => {
      caseNotifier.fetchAndRefresh.and.returnValue(throwError('Failed'));

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
      caseNotifier.fetchAndRefresh.and.returnValue(throwError(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/trigger/COMPLETE/submit', '/home'))
      };

      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

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
      caseNotifier.fetchAndRefresh.and.returnValue(throwError(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/trigger/COMPLETE/process', '/home'))
      };

      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).not.toHaveBeenCalledWith(['/list/case']);
    });

    it('should redirect to no case found page when case cannot be found and previousUrl is event submission', () => {
      const error = {
        status: 400
      };
      caseNotifier.fetchAndRefresh.and.returnValue(throwError(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/trigger/COMPLETE/submit', '/home'))
      };

      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/search/noresults']);
    });

    it('should redirect to default page when case cannot be found and previousUrl is not matching event submission', () => {
      const error = {
        status: 404
      };
      caseNotifier.fetchAndRefresh.and.returnValue(throwError(error));

      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/trigger/COMPLETE/process', '/home'))
      };

      const userInfo = {
        id: '2',
        forename: 'G',
        surname: 'Testing',
        email: 'testing2@mail.com',
        active: true,
        roles: ['caseworker-ia-caseofficer']
      };
      sessionStorageService.getItem.and.returnValue(JSON.stringify(userInfo));

      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/work/my-work/list']);
    });

    it('should redirect to case list page when case id is empty', () => {
      const navigationResult = Promise.resolve('someResult');
      router.navigate.and.returnValue(navigationResult);
      route.paramMap.get.and.returnValue('');

      caseResolver.resolve(route);

      expect(navigationNotifierService.announceNavigation).toHaveBeenCalledWith({action: NavigationOrigin.NO_READ_ACCESS_REDIRECTION});

    });

    it('should avoid making sevice call and return cached case view when cached view exists', () => {
      CASE.case_id = '42';
      caseNotifier.cachedCaseView = CASE;
      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(CASE);
        });
      expect(caseNotifier.fetchAndRefresh).not.toHaveBeenCalled();
      expect(caseNotifier.cachedCaseView).toBe(CASE);
    });

    it('should redirect to restricted case access page when error code is 403', () => {
      const error = {
        status: 403
      };
      caseNotifier.fetchAndRefresh.and.returnValue(throwError(error));

      const userInfo = {
        id: '2',
        forename: 'G',
        surname: 'Testing',
        email: 'testing2@mail.com',
        active: true,
        roles: ['caseworker-ia-caseofficer']
      };
      sessionStorageService.getItem.and.returnValue(JSON.stringify(userInfo));

      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);
      caseResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/cases/restricted-case-access/42']);
    });
  });

  describe('resolve()', () => {

    const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;

    const DRAFT_ID = 'DRAFT42';
    const DRAFT: CaseView = new CaseView();
    DRAFT.case_id = 'DRAFT_CASE_ID_1';

    const DRAFT_CACHED: CaseView = new CaseView();
    DRAFT_CACHED.case_id = 'DRAFT_CASE_CACHED_ID_1';
    const DRAFT_OBS: Observable<CaseView> = of(DRAFT);

    let caseResolver: CaseResolver;
    let draftService: any;

    let caseNotifier: any;
    let casesService: any;
    let alertService: AlertService;
    let navigationNotifierService: NavigationNotifierService;
    let sessionStorageService: any;
    let route: any;

    let router: any;

    beforeEach(() => {
      router = {
        navigate: jasmine.createSpy('navigate'),
        events: of( new NavigationEnd(0, '/case', '/home'))
      };
      caseNotifier = createSpyObj('caseNotifier', ['announceCase']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);
      sessionStorageService = createSpyObj('sessionStorageService', ['getItem']);
      draftService.getDraft.and.returnValue(DRAFT_OBS);
      alertService = createSpyObj('alertService', ['success']);
      navigationNotifierService = createSpyObj('navigationNotifierService', ['announceNavigation']);
      sessionStorageService.getItem.and.returnValue(null);
      caseResolver = new CaseResolver(caseNotifier, draftService, navigationNotifierService, router, sessionStorageService);

      route = {
        firstChild: {
          url: []
        },
        paramMap: createSpyObj('paramMap', ['get'])
      };
      route.paramMap.get.and.returnValue(DRAFT_ID);
    });

    it('should resolve draft and cache when the route is the one for case DRAFT', () => {
      caseNotifier.cachedCaseView = DRAFT_CACHED;

      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(DRAFT);
        });

      expect(draftService.getDraft).toHaveBeenCalledWith(DRAFT_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseNotifier.cachedCaseView).toEqual(DRAFT);
    });

    it('should avoid making sevice call and return cached case view when cached view exists', () => {
      DRAFT.case_id = 'DRAFT42';
      caseNotifier.cachedCaseView = DRAFT;
      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(DRAFT);
        });
      expect(draftService.getDraft).not.toHaveBeenCalled();
      expect(caseNotifier.cachedCaseView).toBe(DRAFT);
    });

    it('should make sevice call when cached case view is not exists', () => {
      DRAFT.case_id = 'DRAFT42';
      caseResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toEqual(DRAFT);
        });
      expect(draftService.getDraft).toHaveBeenCalled();
    });
  });
});
