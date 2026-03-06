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

// TODO(EXUI-2073): Decision needed before adding <NEW_CATEGORY>.
// QUESTION: If <NEW_CATEGORY> is added, should access requests reuse an existing category's rules (and if so, which one) or need new rules?
// CONTEXT: This union is the type contract for `RequestedRole.roleCategory` in assignment payload models.
// CONTEXT: Values outside this list are not type-valid in typed frontend payload construction until explicitly added.
// CONTEXT: UI journeys affected: Case Details -> "Request Challenged Access" and "Request Specific Access".
// CONTEXT: Current allowed values are JUDICIAL, LEGAL_OPERATIONS, ADMIN, PROFESSIONAL, CITIZEN and CTSC only.
export type RoleCategory = 'JUDICIAL' | 'LEGAL_OPERATIONS' | 'ADMIN' | 'PROFESSIONAL' | 'CITIZEN' | 'CTSC';

export type RoleGrantTypeCategory = 'BASIC' | 'STANDARD' | 'SPECIFIC' | 'CHALLENGED' | 'EXCLUDED';

export type RoleClassification = 'PUBLIC' | 'PRIVATE' | 'RESTRICTED';

export type RoleType = 'ORGANISATION' | 'CASE';
