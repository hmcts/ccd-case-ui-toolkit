import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { CaseHistoryResolver } from './case-history.resolver';
import { CaseHistory } from '../domain';

describe('CaseHistoryResolver', () => {
  describe('resolve()', () => {
    const CASE_ID = '42';
    const EVENT_ID = '100';
    const CASE_HISTORY: CaseHistory = createSpyObj<any>('case', ['toString']);
    const CASE_OBS: Observable<CaseHistory> = Observable.of(CASE_HISTORY);

    let caseHistoryResolver: CaseHistoryResolver;

    let caseHistoryService: any;
    let route: any;
    let router: any;

    beforeEach(() => {
      caseHistoryService = createSpyObj('caseHistoryService', ['get']);

      router = createSpyObj('router', ['navigate']);
      caseHistoryResolver = new CaseHistoryResolver(caseHistoryService, router);

      route = {
        firstChild: {
          url: []
        },
        paramMap: createSpyObj('paramMap', ['get']),
        parent: {
          paramMap: createSpyObj('paramMap', ['get'])
        }
      };
      route.parent.paramMap.get.and.returnValue(CASE_ID);
      route.paramMap.get.and.returnValue(EVENT_ID);
    });

    it('should resolve case history when the route is the one for case history view', () => {
      caseHistoryService.get.and.returnValue(CASE_OBS);

      caseHistoryResolver
        .resolve(route)
        .then(caseData => {
          expect(caseData).toBe(CASE_HISTORY);
        });

      expect(route.parent.paramMap.get).toHaveBeenCalledWith(CaseHistoryResolver.PARAM_CASE_ID);
      expect(route.paramMap.get).toHaveBeenCalledWith(CaseHistoryResolver.PARAM_EVENT_ID);
      expect(caseHistoryService.get).toHaveBeenCalledWith(CASE_ID, EVENT_ID);
    });

    it('should redirect to error page when case history cannot be retrieved', () => {
      caseHistoryService.get.and.returnValue(Observable.throw('Failed'));

      caseHistoryResolver
        .resolve(route)
        .then(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/error']);
    });
  });
});
