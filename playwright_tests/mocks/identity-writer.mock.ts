import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const identityField = (id: string, label: string, type: string, children: string[]) => Object.assign(new CaseField(), {
  id, label, display_context: 'MANDATORY', value: null,
  field_type: { id: type, type: 'Complex', complex_fields: children.map((child) => Object.assign(new CaseField(), {
    id: child, label: child, display_context: 'OPTIONAL', value: null, field_type: { id: 'Text', type: 'Text' }
  })) }
});

export const identityWriterFields = {
  caseLink: identityField('writer-link', 'Related case reference', 'CaseLink', ['CaseReference']),
  organisation: identityField('writer-org', 'Organisation', 'Organisation', ['OrganisationID', 'OrganisationName']),
  judicial: identityField('writer-judge', 'Judicial assignee', 'JudicialUser', ['idamId', 'personalCode']),
  staff: Object.assign(identityField('writer-staff', 'Staff assignee', 'StaffUser', ['idamId']), {
    display_context_parameter: '#ARGUMENT(CATEGORY-ADMIN,CATEGORY-JUDICIAL)'
  })
};
export const identityWriterOrganisations = [
  { organisationIdentifier: 'ORG-A', name: 'Alpha Legal', addressLine1: '10 Example Street', addressLine2: null, addressLine3: null, townCity: 'London', county: null, country: 'UK', postCode: 'SW1A 1AA' },
  { organisationIdentifier: 'ORG-B', name: 'Beta Legal', addressLine1: '20 Sample Road', addressLine2: null, addressLine3: null, townCity: 'Leeds', county: null, country: 'UK', postCode: 'LS1 1AA' }
];
export const identityWriterJudges = [
  { idamId: 'shared-user', personalCode: 'J001', fullName: 'Alex Judicial', emailId: 'alex.judicial@example.test' },
  { idamId: 'judge-user', personalCode: 'J002', fullName: 'Alex Judge', emailId: 'alex.judge@example.test' }
];
export const identityWriterStaff = [
  { idamId: 'shared-user', displayName: 'Alex Staff', emailId: 'alex.staff@example.test' }
];
