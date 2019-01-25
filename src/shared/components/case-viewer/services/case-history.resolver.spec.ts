import createSpyObj = jasmine.createSpyObj;
import { Observable } from 'rxjs';
import { CaseHistoryResolver } from './case-history.resolver';
import { CaseHistory } from '../domain';
import { CaseView } from '../../../domain';

describe('CaseHistoryResolver', () => {
  describe('resolve()', () => {
    const JURISDICTION_ID = 'TEST';
    const CASE_TYPE_ID = 'TEST_CASE_TYPE';
    const CASE_ID = '42';
    const EVENT_ID = '100';
    const CASE_HISTORY: CaseHistory = createSpyObj<any>('case', ['toString']);
    const CASE_OBS: Observable<CaseHistory> = Observable.of(CASE_HISTORY);

    const CASE: CaseView = {
      case_id: CASE_ID,
      case_type: {
        id: CASE_TYPE_ID,
        name: '',
        jurisdiction: {
          id: JURISDICTION_ID,
          name: ''
        }
      },
      state: null,
      channels: null,
      tabs: null,
      triggers: null,
      events: null
    };

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
          data: {
            case: CASE
          }
        }
      };
      route.paramMap.get.and.returnValue(EVENT_ID);
    });

    it('should resolve case history when the route is the one for case history view', () => {
      caseHistoryService.get.and.returnValue(CASE_OBS);

      caseHistoryResolver
        .resolve(route)
        .subscribe(caseData => {
          expect(caseData).toBe(CASE_HISTORY);
        });

      expect(route.paramMap.get).toHaveBeenCalledWith(CaseHistoryResolver.PARAM_EVENT_ID);
      expect(caseHistoryService.get).toHaveBeenCalledWith(CASE_ID, EVENT_ID);
    });

    it('should redirect to error page when case history cannot be retrieved', () => {
      caseHistoryService.get.and.returnValue(Observable.throw('Failed'));

      caseHistoryResolver
        .resolve(route)
        .subscribe(data => {
          expect(data).toBeFalsy();
        }, err => {
          expect(err).toBeTruthy();
        });

      expect(router.navigate).toHaveBeenCalledWith(['/error']);
    });
  });
});
