import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const field = (id: string, type: string, label: string, value: any, display_context = 'READONLY') => Object.assign(new CaseField(), {
  id, label, display_context, field_type: { id: type, type }, value
});

export const identityFields = {
  caseLink: field('identity-case-link', 'CaseLink', 'Linked case', { CaseReference: '1234567890123456' }),
  organisation: field('identity-organisation', 'Organisation', 'Organisation', null),
  judicialUser: field('identity-judicial', 'JudicialUser', 'Judge', null),
  staffUser: field('identity-staff', 'StaffUser', 'Staff member', null),
  label: field('identity-label', 'Label', 'A read-only label', 'Read-only label')
};
