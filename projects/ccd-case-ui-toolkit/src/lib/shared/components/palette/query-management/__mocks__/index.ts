import { Queries } from "../domain";

export const queries: Queries = [
  {
    partyName: 'John Smith',
    queryDetails: [
      {
        name: 'Review attached document',
        lastSubmittedBy: 'Maggie Conroy',
        lastSubmissionDate: new Date(2023, 4, 3),
        lastResponseBy: null,
        lastResponseDate: null
      }
    ]
  }
];
