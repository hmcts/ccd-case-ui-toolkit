import { parseStaffUserSearchConfiguration } from './staff-user-search-configuration';

describe('parseStaffUserSearchConfiguration', () => {
  it('should select the staff cache for one staff category', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-ADMIN)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN'],
        staffRoleCategories: ['ADMIN'],
        includesJudicial: false,
        regions: []
      }
    });
  });

  it('should trim and select multiple staff cache categories', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-ADMIN, CATEGORY-CTSC)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN', 'CTSC'],
        staffRoleCategories: ['ADMIN', 'CTSC'],
        includesJudicial: false,
        regions: []
      }
    });
  });

  it('should support the hyphenated LEGAL-OPS alias', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-LEGAL-OPS)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['LEGAL_OPERATIONS'],
        staffRoleCategories: ['LEGAL_OPERATIONS'],
        includesJudicial: false,
        regions: []
      }
    });
  });

  it('should collect the regions to filter on', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-LEGAL-OPS,CATEGORY-ADMIN,REGION-1235)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['LEGAL_OPERATIONS', 'ADMIN'],
        staffRoleCategories: ['LEGAL_OPERATIONS', 'ADMIN'],
        includesJudicial: false,
        regions: ['1235']
      }
    });
  });

  it('should de-duplicate categories and regions while preserving their order', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-CTSC,CATEGORY-ADMIN,CATEGORY-CTSC,REGION-1,REGION-1)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['CTSC', 'ADMIN'],
        staffRoleCategories: ['CTSC', 'ADMIN'],
        includesJudicial: false,
        regions: ['1']
      }
    });
  });

  it('should select only the judicial source for CATEGORY-JUDICIAL', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-JUDICIAL)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['JUDICIAL'],
        staffRoleCategories: [],
        includesJudicial: true,
        regions: []
      }
    });
  });

  it('should select both staff and judicial sources for mixed categories', () => {
    expect(parseStaffUserSearchConfiguration('#ARGUMENT(CATEGORY-ADMIN,CATEGORY-JUDICIAL,REGION-3)')).toEqual({
      valid: true,
      configuration: {
        roleCategories: ['ADMIN', 'JUDICIAL'],
        staffRoleCategories: ['ADMIN'],
        includesJudicial: true,
        regions: ['3']
      }
    });
  });

  [
    undefined,
    '',
    ' ',
    'CATEGORY-ADMIN',
    '#ARGUMENT()',
    '#ARGUMENT(CATEGORY-ADMIN',
    '#ARGUMENT(,CATEGORY-ADMIN)',
    '#ARGUMENT(CATEGORY-ADMIN,)',
    '#ARGUMENT(CATEGORY-ADMIN,,CATEGORY-CTSC)',
    '#ARGUMENT(REGION-1235)',
    '#ARGUMENT(REGION-)',
    '#ARGUMENT(CATEGORY-)',
    '#ARGUMENT(ADMIN)',
    '#ARGUMENT(CATEGORY-ALL)',
    '#ARGUMENT(CATEGORY-PROFESSIONAL)',
    '#ARGUMENT(CATEGORY-CITIZEN)',
    '#ARGUMENT(CATEGORY-admin)',
    '#ARGUMENT(CATEGORY-UNKNOWN)',
    '#ARGUMENT(CATEGORY-ADMIN,CATEGORY-UNKNOWN)'
  ].forEach(displayContextParameter => {
    it(`should reject invalid configuration ${String(displayContextParameter)}`, () => {
      expect(parseStaffUserSearchConfiguration(displayContextParameter)).toEqual({
        valid: false,
        error: 'INVALID_ROLE_CATEGORIES'
      });
    });
  });
});
