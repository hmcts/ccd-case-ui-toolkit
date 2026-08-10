import { RoleCategory } from '../case-view';

export type StaffUserRoleCategory = Extract<
  RoleCategory,
  'ADMIN' | 'CTSC' | 'LEGAL_OPERATIONS' | 'JUDICIAL'
>;

export interface StaffUserSearchConfiguration {
  roleCategories: StaffUserRoleCategory[];
  staffRoleCategories: StaffUserRoleCategory[];
  includesJudicial: boolean;
}

export interface StaffUser {
  idamId: string;
  displayName: string;
}
