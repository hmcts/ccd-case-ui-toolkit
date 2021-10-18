export interface RequestedRole {
  id: string,
  actorIdType: 'IDAM',
  actorId: string,
  roleType: 'ORGANISATION' | 'CASE',
  roleName: string,
  classification: 'PUBLIC' | 'PRIVATE' | 'RESTRICTED',
  grantType: 'BASIC' | 'STANDARD' | 'SPECIFIC' | 'CHALLENGED' | 'EXCLUDED',
  roleCategory: 'JUDICIAL' | 'LEGAL_OPERATIONS' | 'ADMIN' | 'PROFESSIONAL' | 'CITIZEN',
  readOnly: boolean,
  beginTime: Date,
  endTime: Date,
  process: string,
  reference: string,
  status: 'LIVE' | 'REJECTED',
  created: Date,
  log: string,
  attributes: object,
  notes: RequestedRoleNote[]
}

export interface RequestedRoleNote {
  userId: string,
  time: Date,
  comment: string
}
