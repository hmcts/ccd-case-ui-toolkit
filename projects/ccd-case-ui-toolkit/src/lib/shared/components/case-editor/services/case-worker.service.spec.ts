import { waitForAsync } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AbstractAppConfig } from '../../../../app.config';
import { HttpError } from '../../../domain';
import { Caseworker } from '../../../domain/work-allocation/case-worker.model';
import { StaffUser } from '../../../domain/work-allocation/staff-user.model';
import { HttpErrorService, HttpService } from '../../../services';
import { CaseworkerService } from './case-worker.service';
import createSpyObj = jasmine.createSpyObj;

describe('CaseworkerService', () => {
  const API_URL = 'http://aggregated.ccd.reform';
  const CASE_WORKER_URL = `${API_URL}/caseworker/getUserByIdamId`;
  const STAFF_USER_SEARCH_URL = `${API_URL}/caseworker/getUsersByServiceName`;
  const CASE_WORKER_1: Caseworker = {
    idamId: '4321-4321-4321-4321',
    firstName: 'Test',
    lastName: 'Caseworker',
    email: 'testuser@demoenv.com',
    location: null,
    roleCategories: []
  };
  const CASE_WORKERS: Caseworker[] = [
    {
      ...CASE_WORKER_1,
      idamId: 'admin-idam-id',
      firstName: 'Alex',
      lastName: 'Admin',
      email: 'alex.admin@justice.gov.uk',
      roleCategories: ['ADMIN']
    },
    {
      ...CASE_WORKER_1,
      idamId: 'ctsc-idam-id',
      firstName: 'Casey',
      lastName: 'CTSC',
      email: 'casey.ctsc@justice.gov.uk',
      roleCategories: ['CTSC']
    },
    {
      ...CASE_WORKER_1,
      idamId: 'multiple-roles-idam-id',
      firstName: 'Morgan',
      lastName: 'Multiple',
      email: 'morgan.multiple@justice.gov.uk',
      roleCategories: ['ADMIN', 'CTSC']
    },
    {
      ...CASE_WORKER_1,
      idamId: 'legal-operations-idam-id',
      firstName: 'Lee',
      lastName: 'Legal',
      email: 'admin.match@justice.gov.uk',
      roleCategories: ['LEGAL_OPERATIONS']
    }
  ];

  const ERROR: HttpError = new HttpError();
  ERROR.message = 'Critical error!';

  let appConfig: any;
  let httpService: any;
  let errorService: HttpErrorService;
  let caseworkerService: CaseworkerService;

  beforeEach(() => {
    appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
    appConfig.getWorkAllocationApiUrl.and.returnValue(API_URL);
    httpService = createSpyObj<HttpService>('httpService', ['post', 'get']);
    errorService = createSpyObj<HttpErrorService>('errorService', ['setError']);
    caseworkerService = new CaseworkerService(httpService, appConfig, errorService);
  });

  it('should call post with correct parameters', waitForAsync(() => {
    httpService.post.and.returnValue(of([CASE_WORKER_1]));
    caseworkerService.getUserByIdamId(CASE_WORKER_1.idamId)
      .subscribe()
      .add(() => {
        expect(httpService.post).toHaveBeenCalledWith(CASE_WORKER_URL, { idamId: CASE_WORKER_1.idamId });
      });
  }));

  it('should set error service error when the call fails', waitForAsync(() => {
    const userId = '1234-1234-1234-1234';
    httpService.post.and.returnValue(throwError(ERROR));
    caseworkerService.getUserByIdamId(userId)
      .subscribe(() => {
      }, err => {
        expect(err).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
      });
  }));

  it('should post services and search term when searching staff users', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a', 'service-b'], 'alex', ['ADMIN']).subscribe();

    expect(httpService.post).toHaveBeenCalledWith(STAFF_USER_SEARCH_URL, {
      services: ['service-a', 'service-b'],
      term: 'alex'
    });
  }));

  it('should find users matching ADMIN', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a'], '', ['ADMIN']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([
        { idamId: 'admin-idam-id', displayName: 'Alex Admin', emailId: 'alex.admin@justice.gov.uk' },
        { idamId: 'multiple-roles-idam-id', displayName: 'Morgan Multiple', emailId: 'morgan.multiple@justice.gov.uk' }
      ]);
    });
  }));

  it('should find users matching CTSC', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a'], '', ['CTSC']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([
        { idamId: 'ctsc-idam-id', displayName: 'Casey CTSC', emailId: 'casey.ctsc@justice.gov.uk' },
        { idamId: 'multiple-roles-idam-id', displayName: 'Morgan Multiple', emailId: 'morgan.multiple@justice.gov.uk' }
      ]);
    });
  }));

  it('should find users matching any requested staff category without duplicates', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a'], '', ['ADMIN', 'CTSC']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([
        { idamId: 'admin-idam-id', displayName: 'Alex Admin', emailId: 'alex.admin@justice.gov.uk' },
        { idamId: 'ctsc-idam-id', displayName: 'Casey CTSC', emailId: 'casey.ctsc@justice.gov.uk' },
        { idamId: 'multiple-roles-idam-id', displayName: 'Morgan Multiple', emailId: 'morgan.multiple@justice.gov.uk' }
      ]);
    });
  }));

  it('should use name-only matching after filtering by role category', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a'], 'admin', ['ADMIN']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([{
        idamId: 'admin-idam-id', displayName: 'Alex Admin', emailId: 'alex.admin@justice.gov.uk'
      }]);
    });
  }));

  it('should return no users when no caseworker matches the requested search term', waitForAsync(() => {
    httpService.post.and.returnValue(of(CASE_WORKERS));

    caseworkerService.searchStaffUsers(['service-a'], 'nobody', ['LEGAL_OPERATIONS']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([]);
    });
  }));

  it('should return an empty list when the cache returns no users', waitForAsync(() => {
    httpService.post.and.returnValue(of([]));

    caseworkerService.searchStaffUsers(['service-a'], 'alex', ['ADMIN']).subscribe((staffUsers: StaffUser[]) => {
      expect(staffUsers).toEqual([]);
    });
  }));

  it('should set the error service error and rethrow when staff search fails', waitForAsync(() => {
    httpService.post.and.returnValue(throwError(ERROR));

    caseworkerService.searchStaffUsers(['service-a'], 'alex', ['ADMIN']).subscribe(
      () => fail('Expected an error'),
      error => {
        expect(error).toEqual(ERROR);
        expect(errorService.setError).toHaveBeenCalledWith(ERROR);
      }
    );
  }));
});
