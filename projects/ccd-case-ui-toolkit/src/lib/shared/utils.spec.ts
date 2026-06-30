import { AriaDescriber } from '@angular/cdk/a11y';
import { RoleCategory } from './domain';
import { safeJsonParse } from './json-utils';
import { getAMRoleName, getMappedRoleCategory, isWorkAllocationUser, PUI_CASE_MANAGER } from './utils';
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
});

describe('getMappedRoleCategory', () => {

  it('should return a judicial role category when role category is present', () => {
      const roles = [
          'caseworker-something',
          'role22'
      ];
      const roleCategories = [RoleCategory.JUDICIAL];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.JUDICIAL);
  });

  it('should return a judicial role category when role keyword is present', () => {
      const roles = [
          'caseworker-judge',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.JUDICIAL);
  });

  it('should return a professional role category when role category is present', () => {
    const roles = [
        'caseworker-something',
        'role22'
    ];
    const roleCategories = [RoleCategory.PROFESSIONAL];
    const response = getMappedRoleCategory(roles, roleCategories);
    expect(response).toEqual(RoleCategory.PROFESSIONAL);
  });

  it('should return a professional role category when role keyword is present', () => {
      const roles = [
          'caseworker-solicitor',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.PROFESSIONAL);
  });

  it('should return LEGAL_OPERATIONS as default', () => {
      const roles = [
          'caseworker-something',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.LEGAL_OPERATIONS);
  });

  it('should return ADMIN role category when role category is present', () => {
      const roles = [
          'caseworker-something',
          'role22'
      ];
      const roleCategories = [RoleCategory.ADMIN];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.ADMIN);
  });

  it('should return ADMIN role category when role keyword is present', () => {
      const roles = [
          'caseworker-admin',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.ADMIN);
  });

  it('should return CITIZEN role category when role category is present', () => {
      const roles = [
          'caseworker-something',
          'role22'
      ];
      const roleCategories = [RoleCategory.CITIZEN];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.CITIZEN);
  });

  it('should return CITIZEN role category when role keyword is present', () => {
      const roles = [
          'caseworker-citizen',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.CITIZEN);
  });

  it('should return CTSC role category when role category is present', () => {
      const roles = [
          'something',
          'role22'
      ];
      const roleCategories = [RoleCategory.CTSC];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.CTSC);
  });

  it('should return CTSC role category when role keyword is present', () => {
      const roles = [
          'ctsc',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.CTSC);
  });

  it('should return ENFORCEMENT role category when role category is present', () => {
      const roles = [
          'something',
          'role22'
      ];
      const roleCategories = [RoleCategory.ENFORCEMENT];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.ENFORCEMENT);
  });

  it('should return ENFORCEMENT role category when role keyword is present', () => {
      const roles = [
          'enforcement',
          'role22'
      ];
      const roleCategories = [];
      const response = getMappedRoleCategory(roles, roleCategories);
      expect(response).toEqual(RoleCategory.ENFORCEMENT);
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
