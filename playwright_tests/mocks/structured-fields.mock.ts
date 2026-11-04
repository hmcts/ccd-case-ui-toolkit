import { CaseField } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const text = (id: string, label: string, display_context = 'OPTIONAL') => Object.assign(new CaseField(), {
  id, label, display_context, field_type: { id: 'Text', type: 'Text' }, value: null
});

const structured = (id: string, label: string, type: string, fields: CaseField[]) => Object.assign(new CaseField(), {
  id, label, display_context: 'OPTIONAL', field_type: { id: type, type: 'Complex', complex_fields: fields }, value: null
});

export const structuredFields = {
  complex: structured('structured-complex', 'Complex field', 'Complex', [
    text('complex-line', 'Complex line'),
    structured('complex-address', 'Nested address', 'Complex', [
      text('complex-city', 'City'),
      text('complex-country', 'Country')
    ])
  ]),
  requiredComplex: structured('required-complex', 'Required complex field', 'Complex', [text('required-line', 'Required line', 'MANDATORY')])
};
