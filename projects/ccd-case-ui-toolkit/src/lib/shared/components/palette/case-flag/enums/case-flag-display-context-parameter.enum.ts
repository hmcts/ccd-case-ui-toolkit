/**
 * Create and update contexts for external users are, by definition, part of Case Flags 2.1 - thus there is no enum
 * value for these.
 */
export enum CaseFlagDisplayContextParameter {
  CREATE = '#ARGUMENT(CREATE)',
  CREATE_EXTERNAL = '#ARGUMENT(CREATE,EXTERNAL)',
  CREATE_2_POINT_1 = '#ARGUMENT(CREATE,VERSION2.1)',
  READ_EXTERNAL = '#ARGUMENT(READ,EXTERNAL)',
  UPDATE = '#ARGUMENT(UPDATE)',
  UPDATE_EXTERNAL = '#ARGUMENT(UPDATE,EXTERNAL)',
  UPDATE_2_POINT_1 = '#ARGUMENT(UPDATE,VERSION2.1)'
}
