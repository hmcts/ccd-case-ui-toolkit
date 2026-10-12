import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const field = (id: string, type: string, label: string, value: unknown) => Object.assign(new CaseField(), {
  id,
  label,
  display_context: 'READONLY',
  field_type: { id: type, type: 'Complex' },
  value
});

export const referenceIdentityFields = {
  organisation: field('reference-organisation', 'Organisation', 'Organisation', { OrganisationID: 'ORG-123' }),
  judicial: field('reference-judicial', 'JudicialUser', 'Judicial user', { personalCode: 'JUD-123' }),
  staff: field('reference-staff', 'StaffUser', 'Staff user', { idamId: 'staff-123' }),
  staffJudicialFallback: field('reference-staff-judicial', 'StaffUser', 'Judicial fallback', { idamId: 'judicial-123' })
};
