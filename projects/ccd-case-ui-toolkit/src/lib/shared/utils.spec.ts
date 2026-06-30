import { RoleCategory } from './domain';
import { safeJsonParse } from './json-utils';
import { getAMRoleName, getMappedRoleCategories } from './utils';

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
});
