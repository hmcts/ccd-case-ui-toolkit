import { StaffCacheRoleCategory, StaffUser, StaffUserRoleCategory, StaffUserSearchConfiguration } from './staff-user.model';

describe('StaffUser domain contract', () => {
  it('should support a parsed search configuration and selected user', () => {
    const configuration: StaffUserSearchConfiguration = {
      roleCategories: ['ADMIN' as StaffUserRoleCategory, 'JUDICIAL' as StaffUserRoleCategory],
      staffRoleCategories: ['ADMIN' as StaffCacheRoleCategory],
      includesJudicial: true
    };
    const staffUser: StaffUser = {
      idamId: 'idam-123',
      displayName: 'Alex Smith',
      emailId: 'alex.smith@justice.gov.uk'
    };

    const supportedRoleCategory: StaffUserRoleCategory = 'LEGAL_OPERATIONS' as StaffUserRoleCategory;

    expect(configuration.staffRoleCategories).toEqual(['ADMIN' as StaffCacheRoleCategory]);
    expect(configuration.includesJudicial).toBe(true);
    expect(supportedRoleCategory).toBe('LEGAL_OPERATIONS');
    expect(staffUser.displayName).toBe('Alex Smith');
    expect(staffUser.emailId).toBe('alex.smith@justice.gov.uk');
  });
});
