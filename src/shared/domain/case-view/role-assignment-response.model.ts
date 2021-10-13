import { RequestedRole } from './requested-role.model';
import { RoleRequest } from './role-request.model';

export interface RoleAssignmentResponse {
  roleRequest: RoleRequest,
  requestedRoles: RequestedRole[]
}
