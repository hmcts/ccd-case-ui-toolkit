import { parseStaffUserSearchConfiguration } from './staff-user-search-configuration';

describe('parseStaffUserSearchConfiguration', () => {
  it('should select the staff cache for one staff category', () => {
    expect(parseStaffUserSearchConfiguration('ADMIN')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN'],
        staffRoleCategories: ['ADMIN'],
        includesJudicial: false
      }
    });
  });

  it('should trim and select multiple staff cache categories', () => {
    expect(parseStaffUserSearchConfiguration('ADMIN, CTSC')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN', 'CTSC'],
        staffRoleCategories: ['ADMIN', 'CTSC'],
        includesJudicial: false
      }
    });
  });

  it('should de-duplicate categories while preserving their order', () => {
    expect(parseStaffUserSearchConfiguration('CTSC,ADMIN,CTSC')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['CTSC', 'ADMIN'],
        staffRoleCategories: ['CTSC', 'ADMIN'],
        includesJudicial: false
      }
    });
  });

  it('should select only the judicial source for JUDICIAL', () => {
    expect(parseStaffUserSearchConfiguration('JUDICIAL')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['JUDICIAL'],
        staffRoleCategories: [],
        includesJudicial: true
      }
    });
  });

  it('should select both staff and judicial sources for mixed categories', () => {
    expect(parseStaffUserSearchConfiguration('ADMIN,JUDICIAL')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN', 'JUDICIAL'],
        staffRoleCategories: ['ADMIN'],
        includesJudicial: true
      }
    });
  });

  [undefined, '', ' ', ',ADMIN', 'ADMIN,', 'ADMIN,,CTSC', 'ALL', 'PROFESSIONAL', 'CITIZEN', 'admin', 'UNKNOWN', 'ADMIN,UNKNOWN']
    .forEach(roleCategories => {
      it(`should reject invalid configuration ${String(roleCategories)}`, () => {
        expect(parseStaffUserSearchConfiguration(roleCategories)).toEqual({
          valid: false,
          error: 'INVALID_ROLE_CATEGORIES'
        });
      });
    });
});
