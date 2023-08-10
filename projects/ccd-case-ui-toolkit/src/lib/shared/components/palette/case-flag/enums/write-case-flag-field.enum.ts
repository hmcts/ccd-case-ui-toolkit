export enum CaseFlagFieldState {
  FLAG_LOCATION,
  FLAG_TYPE,
  FLAG_LANGUAGE_INTERPRETER,
  FLAG_COMMENTS,
  FLAG_STATUS,
  FLAG_MANAGE_CASE_FLAGS,
  FLAG_UPDATE,
  FLAG_UPDATE_WELSH_TRANSLATION,
}

export enum CaseFlagErrorMessage {
  NO_EXTERNAL_FLAGS_COLLECTION = 'External collection for storing this case flag has not been configured for this case type',
  NO_INTERNAL_FLAGS_COLLECTION = 'Internal collection for storing this case flag has not been configured for this case type'
}
