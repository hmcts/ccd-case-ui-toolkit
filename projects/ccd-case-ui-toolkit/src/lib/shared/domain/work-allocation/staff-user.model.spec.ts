import { StaffUser, StaffUserRoleCategory, StaffUserSearchConfiguration } from './staff-user.model';

describe('StaffUser domain contract', () => {
  it('should support a parsed search configuration and selected user', () => {
    const configuration: StaffUserSearchConfiguration = {
      roleCategories: ['ADMIN', 'JUDICIAL'],
      staffRoleCategories: ['ADMIN'],
      includesJudicial: true
    };
    const staffUser: StaffUser = {
      idamId: 'idam-123',
      displayName: 'Alex Smith'
    };

    const supportedRoleCategory: StaffUserRoleCategory = 'LEGAL_OPERATIONS';

    expect(configuration.staffRoleCategories).toEqual(['ADMIN']);
    expect(configuration.includesJudicial).toBe(true);
    expect(supportedRoleCategory).toBe('LEGAL_OPERATIONS');
    expect(staffUser.displayName).toBe('Alex Smith');
  });
});
