export interface RoleRequest {
  id: string,
  authenticatedUserId?: string,
  correlationId?: string,
  assignerId: string,
  requestType?: 'CREATE',
  process: string,
  reference: string,
  replaceExisting: boolean,
  status?: 'APPROVED',
  created?: Date,
  log?: string
}
