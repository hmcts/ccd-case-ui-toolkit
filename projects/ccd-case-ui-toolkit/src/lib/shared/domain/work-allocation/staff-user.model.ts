import { RoleCategory } from '../case-view';

export type StaffUserRoleCategory = Extract<
  RoleCategory,
  'ADMIN' | 'CTSC' | 'LEGAL_OPERATIONS' | 'JUDICIAL'
>;

export type StaffCacheRoleCategory = Exclude<StaffUserRoleCategory, 'JUDICIAL'>;

export interface StaffUserSearchConfiguration {
  roleCategories: StaffUserRoleCategory[];
  staffRoleCategories: StaffCacheRoleCategory[];
  includesJudicial: boolean;
}

export interface StaffUser {
  idamId: string;
  displayName: string;
  emailId?: string;
}
