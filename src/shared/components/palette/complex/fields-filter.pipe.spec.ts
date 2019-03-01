import { FieldsFilterPipe } from './fields-filter.pipe';
import { CaseField } from '../../../domain/definition/case-field.model';
import { newCaseField, createFieldType } from '../../../fixture';

describe('FieldsFilterPipe', () => {

  const caseBuilder = (fields: CaseField[], value?: any): CaseField => {
    return newCaseField('Applicant', 'Applicant', null,
      createFieldType('ApplicantType', 'Complex', fields), 'OPTIONAL') .withValue(value).build();
  };

  let fieldsFilter: FieldsFilterPipe;

  beforeEach(() => {
    fieldsFilter = new FieldsFilterPipe();
  });

  it('should handle null or undefined fields', () => {
    expect(fieldsFilter.transform(undefined)).toEqual([]);
    expect(fieldsFilter.transform(null)).toEqual([]);
  });

  describe('with value embedded in fields', () => {
    const FIELDS_WITH_VALUES: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build()
    ];

    const FIELDS_WITH_VALUES_AND_MISSING: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
      newCaseField('PersonLastName', 'Last name', null, null, 'OPTIONAL').build()
    ];

    const FIELDS_WITH_VALUES_AND_FALSE: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
      newCaseField('PersonGender', 'Gender', null,
        createFieldType('YesOrNo', 'YesOrNo'), 'OPTIONAL').withValue(false).build(),
    ];

    const FIELDS_WITH_VALUES_AND_ZERO: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
      newCaseField('PersonChildren', 'Children', null,
        createFieldType('Number', 'Number'), 'OPTIONAL').withValue(0).build(),
    ];

    it('should return fields with embedded value as is', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value empty', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = '';

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value `undefined`', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = undefined;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value `null`', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = null;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should NOT filter out fields with embedded value `false`', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_FALSE));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_FALSE);
    });

    it('should NOT filter out fields with embedded value `0`', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_ZERO));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_ZERO);
    });
  });

  describe('with value outside of fields', () => {
    const EXPECTED_FILTERED_FIELDS: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
    ];

    const FIELDS_WITHOUT_VALUES: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').build(),
      newCaseField('PersonLastName', 'Last name', null, null, 'OPTIONAL').build()
    ];

    const FIELDS_WITH_VALUES: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
      newCaseField('PersonLastName', 'Last name', null, null, 'OPTIONAL').withValue('Doe').build()
    ];

    const VALUES_ALL = {
      'PersonFirstName': 'John',
      'PersonLastName': 'Doe'
    };

    const VALUES_AND_MISSING = {
      'PersonFirstName': 'John'
    };

    it('should return fields with external value as fields with embedded value', () => {
      FIELDS_WITH_VALUES[1].value = 'Doe';

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_ALL));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with external value empty', () => {
      VALUES_AND_MISSING['PersonLastName'] = '';

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should filter out fields with external value `undefined`', () => {
      VALUES_AND_MISSING['PersonLastName'] = undefined;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should filter out fields with external value `null`', () => {
      VALUES_AND_MISSING['PersonLastName'] = null;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should NOT filter out fields with external value `0`', () => {
      VALUES_AND_MISSING['PersonLastName'] = 0;
      FIELDS_WITH_VALUES[1].value = 0;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should NOT filter out fields with external value `false`', () => {
      VALUES_AND_MISSING['PersonLastName'] = false;
      FIELDS_WITH_VALUES[1].value = false;

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });
  });

  describe('with complex type in fields', () => {
    const COMPLEX_WITH_CHILDREN: CaseField[] = [
      newCaseField('Person', 'Person', null,
        createFieldType('Person', 'Complex', [
          newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
        ]), 'OPTIONAL').build(),
    ];

    const COMPLEX_WITHOUT_CHILDREN: CaseField[] = [
      newCaseField('Person', 'Person', null,
        createFieldType('Person', 'Complex', []), 'OPTIONAL').build(),
    ];

    const COMPLEX_WITH_EMPTY_CHILDREN: CaseField[] = [
      newCaseField('Person', 'Person', null,
        createFieldType('Person', 'Complex', [
          newCaseField('FirstName', 'First name', null, null, 'OPTIONAL').withValue('').build(),
        ]), 'OPTIONAL').build(),
    ];

    const COMPLEX_WITH_EXTERNAL_VALUES: CaseField = newCaseField('Person', 'Person', null,
      createFieldType('Person', 'Complex', [
        newCaseField('FirstNameContainerContainer', 'First name container container', null,
          createFieldType('Complex', 'Complex', [
            newCaseField('FirstNameContainer', 'First name container', null,
              createFieldType('Complex', 'Complex', [
                newCaseField('FirstName', 'First name', null, null, 'OPTIONAL').withValue('Doe').build()
              ]), 'OPTIONAL').build()
          ]), 'OPTIONAL').withValue('').build(),
      ]), 'OPTIONAL').build();

    it('should NOT filter out Complex, even though Complex value itself is undefined but children have values', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITH_CHILDREN));

      expect(filteredFields).toEqual(COMPLEX_WITH_CHILDREN);
    });

    it('should filter out Complex without fields', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITHOUT_CHILDREN));

      expect(filteredFields).toEqual([]);
    });

    it('should filter out Complex when ALL children have empty values', () => {
      let filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITH_EMPTY_CHILDREN));

      expect(filteredFields).toEqual([]);
    });

    it('should NOT filter out Complex which has a great-grand-child with value', () => {
      let filteredFields = fieldsFilter.transform(COMPLEX_WITH_EXTERNAL_VALUES);

      expect(filteredFields.length).toEqual(1);
    });
  });

  describe('option to keep empty fields', () => {
    const FIELDS_WITH_VALUES_AND_MISSING: CaseField[] = [
      newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL').withValue('John').build(),
      newCaseField('PersonLastName', 'Last name', null, null, 'OPTIONAL').build()
    ];

    it('should not filter out fields with embedded value empty', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = '';

      let filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING), true);

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_MISSING);
    });
  });
});
