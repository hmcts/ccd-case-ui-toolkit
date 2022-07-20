export enum LinkedCasesPages {
  BEFORE_YOU_START,
  NO_LINKED_CASES,
  LINK_CASE,
  UNLINK_CASE,
  CHECK_YOUR_ANSWERS
}

export enum LinkedCasesErrorMessages {
  ProposedCaseWithIn = 'Case can not be linked to the same case',
  CaseNumberError = 'Case numbers must have 16 digits',
  ReasonSelectionError = 'Select a reason why these cases should be linked',
  SomethingWrong = 'Something went wrong, please try again later',
  CaseCheckAgainError = 'Check the case number and try again',
  CaseSelectionError = 'You need to propose at least one case',
  CaseProposedError = 'This case has already been proposed',
  CasesLinkedError = 'These cases are already linked',
  UnlinkCaseSelectionError = 'Select a case to unlink before continue',
  LinkCasesNavigationError = 'Please select Next to link case(s)',
  UnlinkCasesNavigationError = 'Please select Next to unlink case(s)',
  BackNavigationError = 'Please select Back to go to the previous page'
}

export enum LinkedCasesEventTriggers {
  LINK_CASES = 'Link cases',
  MANAGE_CASE_LINKS = 'Manage case links'
}