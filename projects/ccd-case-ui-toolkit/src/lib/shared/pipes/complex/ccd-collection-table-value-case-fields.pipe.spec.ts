import { CaseField } from '../../domain';
import { newCaseField, textFieldType } from '../../fixture';
import { CcdCollectionTableCaseFieldsFilterPipe } from './ccd-collection-table-value-case-fields.pipe';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';

describe('CcdCollectionTableCaseFieldsFilterPipe', () => {
  describe('child label state through the collection pipeline', () => {
    (['CaseField instance', 'plain object'] as const).forEach(sourceType => {
      (['isTranslated', 'translationHandledLocally'] as const).forEach(flag => {
        it(`should preserve ${flag} from a ${sourceType} through both filters`, () => {
          const properties = {
            id: 'contact', label: 'Contact PRIVATE_NAME',
            field_type: { id: 'Text', type: 'Text' },
            isTranslated: false, translationHandledLocally: false,
            [flag]: true, value: undefined
          };
          const source = sourceType === 'CaseField instance'
            ? Object.assign(new CaseField(), properties)
            : properties as unknown as CaseField;
          const entries = [{
            key: 'contact',
            value: { caseField: source, label: source.label, type: { type: 'Text' } }
          }];
          const parent = Object.assign(new CaseField(), { id: 'contacts', label: 'Contacts' });
          const row = { contact: 'Row value' };

          const wrapper = new CcdCollectionTableCaseFieldsFilterPipe().transform(entries, parent, row);
          const copiedDefinition = wrapper.field_type.complex_fields[0];
          const [renderedChild] = new ReadFieldsFilterPipe().transform(wrapper, true);

          expect(copiedDefinition).not.toBe(source);
          expect(copiedDefinition.isTranslated).toBe(source.isTranslated);
          expect(copiedDefinition.translationHandledLocally).toBe(source.translationHandledLocally);
          expect(renderedChild.label).toBe('Contact PRIVATE_NAME');
          expect(renderedChild.value).toBe('Row value');
          expect(renderedChild.isTranslated).toBe(source.isTranslated);
          expect(renderedChild.translationHandledLocally).toBe(source.translationHandledLocally);
          expect(source.value).toBeUndefined();
          expect(source[flag]).toBe(true);
          expect(row).toEqual({ contact: 'Row value' });
        });
      });
    });

    it('should not mark an unrelated child handled when the parent has a handled label', () => {
      const source = newCaseField('contact', 'Contact', null, textFieldType(), 'OPTIONAL').build();
      const parent = Object.assign(new CaseField(), {
        id: 'contacts', label: 'Contacts PRIVATE_NAME',
        isTranslated: true, translationHandledLocally: true
      });
      const entries = [{
        key: 'contact', value: { caseField: source, label: source.label, type: { type: 'Text' } }
      }];

      const wrapper = new CcdCollectionTableCaseFieldsFilterPipe()
        .transform(entries, parent, { contact: 'Row value' });
      const [renderedChild] = new ReadFieldsFilterPipe().transform(wrapper, true);

      expect(renderedChild.label).toBe('Contact');
      expect(!!renderedChild.isTranslated).toBe(false);
      expect(!!renderedChild.translationHandledLocally).toBe(false);
      expect(source.isTranslated).toBe(false);
      expect(source.translationHandledLocally).toBe(false);
    });
  });

  const CASE_FIELDS: Record<string, any>[] = [
    {
      key: 'hearingShowDetails',
      value: {
        caseField: {
          id: 'hearingShowDetails',
          label: 'Show Hearing Details',
          field_type: {
            id: 'YesOrNo',
            type: 'YesOrNo',
          }
        },
        label: 'Show Hearing Details',
        type: {
          type: 'YesOrNo',
        }
      }
    }
  ];

  const CASE_FIELD = {
    id: 'Hearing',
    label: '',
    hidden: false,
    field_type: {
      complex_fields: [
        newCaseField('AddressLine1', 'Line 1', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine5', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine4', 'Line 3', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine3', 'Line 2', null, textFieldType(), 'OPTIONAL').build(),
        newCaseField('AddressLine2', 'Line 3', null, textFieldType(), 'OPTIONAL').build()
      ],
      id: 'Hearing',
      type: 'Complex'
    },
    display_context_parameter: '#TABLE(Hearing_type,Hearing_venue)'
  };
  it('to create complex case field with a single case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS, CASE_FIELD as CaseField, {});
    expect(RESULT.field_type.complex_fields.length).toBe(1);
    expect(RESULT.field_type.complex_fields[0].id).toBe('hearingShowDetails');
    expect(RESULT.id).toBe('Hearing');
    expect(RESULT.field_type.type).toBe('Complex');
  });

  it('should create a complex case field without a single case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform([], CASE_FIELD as CaseField, {});
    expect(RESULT.field_type.complex_fields.length).toBe(0);
    expect(RESULT.id).toBe('Hearing');
    expect(RESULT.field_type.type).toBe('Complex');
  });

  it('should create a case field with appropriate values', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform(CASE_FIELDS, CASE_FIELD as CaseField, {
        AddressLine1: 'AAFlat 10',
        AddressLine2: 111,
        AddressLine3: 444,
        AddressLine4: 666
      }
    );
    expect(RESULT.field_type.complex_fields.length).toBe(1);
    expect(RESULT.id).toBe('Hearing');
    expect(RESULT.value.AddressLine1).toBe('AAFlat 10');
    expect(RESULT.value.AddressLine2).toBe(111);
    expect(RESULT.value.AddressLine3).toBe(444);
    expect(RESULT.value.AddressLine4).toBe(666);
  });

  it('should create a plain case field', () => {
    const pipe = new CcdCollectionTableCaseFieldsFilterPipe();
    const RESULT = pipe.transform([], null, {});
    expect(RESULT.field_type.complex_fields.length).toBe(0);
    expect(RESULT.id).toBe('');
    expect(RESULT.label).toBe('');
  });
});
