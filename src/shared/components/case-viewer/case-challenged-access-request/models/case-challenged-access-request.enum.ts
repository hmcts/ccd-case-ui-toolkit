export enum AccessReason {
  LINKED_TO_CURRENT_CASE = 'The cases or parties are linked to my current case',
  CONSOLIDATE_CASE = 'To determine if the case needs to be consolidated',
  ORDER_FOR_TRANSFER = 'To consider an order for transfer',
  OTHER = 'Other reason'
}

export enum ChallengedAccessRequestPageText {
  TITLE = 'Why do you need to access this case?',
  HINT = 'Select a reason.',
  CASE_REF = 'Case reference'
}

export enum ChallengedAccessRequestErrors {
  NO_SELECTION = 'Select a reason',
  NO_CASE_REFERENCE = 'Enter a case reference',
  NO_REASON = 'Enter a reason'
}
