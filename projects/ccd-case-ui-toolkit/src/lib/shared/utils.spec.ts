import { RoleCategory } from './domain';
import { safeJsonParse } from './json-utils';
import { getAMRoleName, getMappedRoleCategories, isInternalUser, isWorkAllocationUser } from './utils';
import { SessionStorageService } from 'ccd-case-ui-toolkit';

describe('safeJsonParse', () => {
  it('returns fallback when value is null', () => {
    const result = safeJsonParse(null, { ok: false });
    expect(result).toEqual({ ok: false });
  });

  it('parses valid JSON', () => {
    const result = safeJsonParse('{"ok": true}', { ok: false });
    expect(result).toEqual({ ok: true });
  });

  it('returns fallback when value is invalid JSON', () => {
    const result = safeJsonParse('{not-json', { ok: false });
    expect(result).toEqual({ ok: false });
  });
});

describe('isInternalUser', () => {
    const sessionStorageService = {} as SessionStorageService;

    it('is false when no user details', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue(null);
        expect(isInternalUser(sessionStorageService)).toBeFalsy();
    });

    it('is true when user has no roles', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": []}');
        expect(isInternalUser(sessionStorageService)).toBeTruthy();
    });

    it('is false when user has case manager role', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["pui-case-manager"]}');
        expect(isInternalUser(sessionStorageService)).toBeFalsy();
    });

    it('is false when user has judge role', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["some-judge-role"]}');
        expect(isInternalUser(sessionStorageService)).toBeFalsy();
    });

    it('is true when user has some other role that is not a judge or case manager', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["some-other-role"]}');
        expect(isInternalUser(sessionStorageService)).toBeTruthy();
    });

    it('is false when user has an enforcement role name', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["some-enforcement-role"]}');
        expect(isInternalUser(sessionStorageService)).toBeTruthy();
    });

    it('is true when user has case manager role but has an enforcement role category', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["pui-case-manager"], "roleCategories": ["ENFORCEMENT"]}');
        expect(isInternalUser(sessionStorageService)).toBeTruthy();
    });

    it('is true when user has judge role but has an enforcement role category', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["some-judge-role"], "roleCategories": ["ENFORCEMENT"]}');
        expect(isInternalUser(sessionStorageService)).toBeTruthy();
    });
});

describe('isWorkAllocationUser', () => {
    const sessionStorageService = {} as SessionStorageService;

    it('is false when no user details', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue(null);
        expect(isWorkAllocationUser(sessionStorageService)).toBeFalsy();
    });

    it('is false when user has no roles', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": []}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeFalsy();
    });

    it('is false when user has case manager role', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["pui-case-manager"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeFalsy();
    });

    it('is false when user has no specified work allocation role', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeFalsy();
    });

    it('is true when user has a specified work allocation role', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker-ia-iacjudge"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();

        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker-ia-caseofficer"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();

        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker-ia-admofficer"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();

        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker-civil"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();

        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker-privatelaw"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();
    });

    it('is true when user has an ENFORCEMENT role category', () => {
        sessionStorageService.getItem = jasmine.createSpy('getItem').and.returnValue('{"roles": ["caseworker"], "roleCategories": ["ENFORCEMENT"]}');
        expect(isWorkAllocationUser(sessionStorageService)).toBeTruthy();
    });
});

describe('getMappedRoleCategories', () => {

    it('should return a role category when role category is present', () => {
        const roles = [
            'caseworker-something',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['LEGAL_OPERATIONS' as RoleCategory]);
    });

    it('should return a role category when role category is not present', () => {
        const roles = [
            'solicitor',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['PROFESSIONAL' as RoleCategory]);
    });

    it('should return LEGAL_OPERATIONS as default', () => {
        const roles = [
            'caseworker-something',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['LEGAL_OPERATIONS' as RoleCategory]);
    });

    it('should return ADMIN as response', () => {
        const roles = [
            'caseworker-admin',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['ADMIN' as RoleCategory, 'LEGAL_OPERATIONS' as RoleCategory]);
    });

    it('should return CITIZEN as response', () => {
        const roles = [
            'citizen',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['CITIZEN' as RoleCategory]);
    });

    it('should return CTSC as response', () => {
        const roles = [
            'ctsc',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['CTSC' as RoleCategory]);
    });

    it('should return multiple categories as response', () => {
        const roles = [
            'ctsc',
            'citizen',
            'judge'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['JUDICIAL' as RoleCategory, 'CITIZEN' as RoleCategory, 'CTSC' as RoleCategory]);
    });

    it('should return ENFORCEMENT role category when role keyword is present', () => {
        const roles = [
            'enforcement',
            'role22'
        ];
        const response = getMappedRoleCategories(roles);
        expect(response).toEqual(['ENFORCEMENT' as RoleCategory]);
    });
});


describe('getAMRoleName', () => {

  it('should return judicial role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.JUDICIAL);
      expect(response).toEqual('dummy-access-judiciary');
  });

  it('should return citizen role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.CITIZEN);
      expect(response).toEqual('dummy-access-citizen');
  });

  it('should return professional role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.PROFESSIONAL);
      expect(response).toEqual('dummy-access-professional');
  });

  it('should return legal-ops role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.LEGAL_OPERATIONS);
      expect(response).toEqual('dummy-access-legal-ops');
  });

  it('should return admin role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.ADMIN);
      expect(response).toEqual('dummy-access-admin');
  });

  it('should return ctsc role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.CTSC);
      expect(response).toEqual('dummy-access-ctsc');
  });
  
  it('should return enforcement role name', () => {
      const response = getAMRoleName('dummy', RoleCategory.ENFORCEMENT);
      expect(response).toEqual('dummy-access-enforcement');
  });
});
