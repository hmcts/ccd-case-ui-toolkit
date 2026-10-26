import { UserInfo } from './user-info.model';

export interface UserDetails {
  sessionTimeout: {
    idleModalDisplayTime: number,
    totalIdleTime: number,
  };
  canShareCases: boolean;
  userInfo: UserInfo;
  roleAssignmentInfo?: RoleAssignmentInfo[];
}

export interface RoleAssignmentInfo {
  primaryLocation?: string;
  baseLocation?: string;
  jurisdiction?: string;
  substantive?: string;
  isCaseAllocator: boolean;
  bookable?: boolean | string;
  region?: string;
  roleType?: string;
  roleName?: string;
  roleCategory?: string;
  beginTime?: string;
  endTime?: string;
  caseId?: string;
}
