export enum CaseFlagFieldState {
  FLAG_LOCATION,
  FLAG_TYPE,
  FLAG_LANGUAGE_INTERPRETER,
  FLAG_COMMENTS,
  FLAG_SUMMARY
}

export enum CaseFlagLocationStepText {
  CAPTION = 'Create a case flag',
  TITLE = 'Where should this flag be added?'
}

export enum CaseFlagLocationStepErrors {
  NO_SELECTION = 'Please make a selection'
}
