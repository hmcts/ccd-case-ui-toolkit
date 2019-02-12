import { CaseResolver } from './case.resolver';
import { Observable } from 'rxjs';
import createSpyObj = jasmine.createSpyObj;
import { CaseView } from '../../../domain';
import { DraftService, AlertService } from '../../../services';

describe('CaseResolver', () => {
  describe('resolve()', () => {

    const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;

    const CASE_ID = '42';
    const CASE: CaseView = createSpyObj<any>('case', ['toString']);
    const CASE_CACHED: CaseView = createSpyObj<any>('caseCached', ['toString']);
    const CASE_OBS: Observable<CaseView> = Observable.of(CASE);

    let caseResolver: CaseResolver;
    let draftService: DraftService;

    let casesService: any;
    let caseService: any;
    let alertService: AlertService;
    let route: any;

    let router: any;

    beforeEach(() => {
      caseService = createSpyObj('caseService', ['announceCase']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);

      router = createSpyObj('router', ['navigate']);
      alertService = createSpyObj('alertService', ['success']);
      caseResolver = new CaseResolver(caseService, casesService, draftService, router, alertService);

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
          expect(caseData).toBe(CASE);
        });

      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toBe(CASE);
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
          expect(caseData).toBe(CASE);
        });

          expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      // allows to access private cachedCaseView field
          expect(caseResolver['cachedCaseView']).toBe(CASE);
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
      expect(caseResolver['cachedCaseView']).toBe(CASE_CACHED);
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
          expect(caseData).toBe(CASE);
        });

      expect(casesService.getCaseViewV2).toHaveBeenCalledWith(CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toBe(CASE);
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

    it('should redirect to case list page when case id is empty', () => {
      let navigationResult = Promise.resolve('someResult');
      router.navigate.and.returnValue(navigationResult);
      route.paramMap.get.and.returnValue('');

      caseResolver.resolve(route);

      expect(router.navigate).toHaveBeenCalledWith(['/list/case']);

      navigationResult.then(() => {
        expect(alertService.success).toHaveBeenCalledWith(CaseResolver.CASE_CREATED_MSG);
      });
    });
  });

  describe('resolve()', () => {

    const PARAM_CASE_ID = CaseResolver.PARAM_CASE_ID;

    const DRAFT_ID = 'DRAFT42';
    const DRAFT: CaseView = createSpyObj<any>('draft', ['toString']);
    const DRAFT_CACHED: CaseView = createSpyObj<any>('draftCached', ['toString']);
    const DRAFT_OBS: Observable<CaseView> = Observable.of(DRAFT);

    let caseResolver: CaseResolver;
    let draftService: any;

    let caseService: any;
    let casesService: any;
    let alertService: AlertService;
    let route: any;

    let router: any;

    beforeEach(() => {
      caseService = createSpyObj('caseService', ['announceCase']);
      casesService = createSpyObj('casesService', ['getCaseViewV2']);
      draftService = createSpyObj('draftService', ['getDraft']);
      draftService.getDraft.and.returnValue(DRAFT_OBS);
      router = createSpyObj('router', ['navigate']);
      alertService = createSpyObj('alertService', ['success']);
      caseResolver = new CaseResolver(caseService, casesService, draftService, router, alertService);

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
          expect(caseData).toBe(DRAFT);
        });

      expect(draftService.getDraft).toHaveBeenCalledWith(DRAFT_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(PARAM_CASE_ID);
      // allows to access private cachedCaseView field
      expect(caseResolver['cachedCaseView']).toBe(DRAFT);
    });
  });
});
