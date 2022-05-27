export enum LinkedCasesPages {
  BEFORE_YOU_START,
  LINK_CASE,
  UNLINK_CASE,
  CHECK_YOUR_ANSWERS
}

export enum LinkedCasesErrorMessages {
  CaseNumberError = 'Case numbers must have 16 digits',
  ReasonSelectionError = 'Select a reason why these cases should be linked',
  SomethingWrong = 'Something went wrong, please try again later',
  CaseCheckAgainError = 'Check the case number and try again',
  CaseSelectionError = 'You need to propose at least one case',
  CaseProposedError = 'This case has already been proposed',
  CasesLinkedError = 'These cases are already linked',
  UnlinkCaseSelectionError = 'Select a case before continue'
}

export enum LinkedCasesEventTriggers {
  LINK_CASES = 'linkCases',
  MANAGE_CASE_LINKS = 'manageCaseLinks'
}
