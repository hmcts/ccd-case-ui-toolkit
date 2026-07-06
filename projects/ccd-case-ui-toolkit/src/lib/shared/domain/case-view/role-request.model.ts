export interface RoleRequestPayload {
  roleRequest: RoleRequest;
  requestedRoles: RequestedRole[];
}

export interface RequestedRole {
  actorIdType: 'IDAM';
  actorId: string;
  roleType: RoleType;
  roleName: string;
  classification: RoleClassification;
  grantType: RoleGrantTypeCategory;
  roleCategory: RoleCategory;
  readOnly?: boolean;
  beginTime: Date;
  endTime: Date;
  authorisations?: string[];
  attributes: object;
  notes: RequestedRoleNote[];
}

export interface RoleRequest {
  assignerId: string;
  process: string;
  replaceExisting: boolean;
  reference: string;
}

export interface RequestedRoleNote {
  userId: string;
  time: Date;
  comment: string;
}

export enum RoleCategory {
  JUDICIAL = 'JUDICIAL',
  LEGAL_OPERATIONS = 'LEGAL_OPERATIONS',
  ADMIN = 'ADMIN',
  CTSC = 'CTSC',
  PROFESSIONAL = 'PROFESSIONAL',
  CITIZEN = 'CITIZEN',
  ENFORCEMENT = 'ENFORCEMENT'
}

export enum AMRoleSuffix {
  JUDICIARY = 'judiciary',
  ADMIN = 'admin',
  PROFESSIONAL = 'professional',
  LEGAL_OPERATIONS = 'legal-ops',
  CITIZEN = 'citizen',
  CTSC = 'ctsc',
  ENFORCEMENT = 'enforcement'
}

export enum RoleKeyword {
  JUDGE = 'judge',
  ADMIN = 'admin',
  SOLICITOR = 'solicitor',
  CITIZEN = 'citizen',
  CTSC = 'ctsc',
  ENFORCEMENT = 'enforcement'
}

export type RoleGrantTypeCategory = 'BASIC' | 'STANDARD' | 'SPECIFIC' | 'CHALLENGED' | 'EXCLUDED';

export type RoleClassification = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

export type RoleType = 'ORGANISATION' | 'CASE';
