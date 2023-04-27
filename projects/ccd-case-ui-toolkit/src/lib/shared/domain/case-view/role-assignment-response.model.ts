import { RequestedRole, RoleRequest } from './role-request.model';

export interface RoleAssignmentResponse {
  roleRequest: RoleRequest;
  requestedRoles: RequestedRole[];
}
