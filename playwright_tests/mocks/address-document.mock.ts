import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const text = (id: string, label: string) => Object.assign(new CaseField(), {
  id,
  label,
  display_context: 'OPTIONAL',
  field_type: { id: 'Text', type: 'Text' },
  value: null
});

const address = (id: string, label: string, type: 'AddressUK' | 'AddressGlobalUK') => Object.assign(new CaseField(), {
  id,
  label,
  display_context: 'OPTIONAL',
  field_type: {
    id: type,
    type: 'Complex',
    complex_fields: [text('AddressLine1', 'Address line 1'), text('AddressLine2', 'Address line 2'), text('AddressLine3', 'Address line 3'), text('PostTown', 'Town or city'), text('County', 'County'), text('PostCode', 'Postcode'), text('Country', 'Country')]
  },
  value: null
});

export const addressDocumentFields = {
  uk: address('address-uk', 'UK address', 'AddressUK'),
  global: address('address-global', 'Global address', 'AddressGlobalUK'),
  document: Object.assign(new CaseField(), {
    id: 'supporting-document',
    label: 'Supporting document',
    display_context: 'OPTIONAL',
    field_type: { id: 'Document', type: 'Document', regular_expression: 'pdf' },
    value: {
      document_url: 'https://document.example/documents/initial',
      document_binary_url: 'https://document.example/documents/initial/binary',
      document_filename: 'initial.pdf'
    }
  })
};
