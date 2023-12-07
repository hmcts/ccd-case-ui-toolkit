import { CaseField } from '../../domain/definition/case-field.model';
import { FieldsFilterPipe } from './fields-filter.pipe';

describe('FieldsFilterPipe', () => {

  const caseBuilder = (fields: CaseField[], value?: any): CaseField => {
    return ({
      id: 'Applicant',
      label: 'Applicant',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'ApplicantType',
        type: 'Complex',
        complex_fields: fields
      },
      value
    }) as CaseField;
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
      ({
        id: 'PersonFirstName',
        label: 'First name',
        value: 'John',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField
    ];

    const FIELDS_WITH_VALUES_AND_MISSING: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        value: 'John',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField
    ];

    const FIELDS_WITH_VALUES_AND_FALSE: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        value: 'John',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField,
      ({
        id: 'PersonGender',
        label: 'Gender',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'YesOrNo',
          type: 'YesOrNo'
        },
        value: false
      }) as CaseField
    ];

    const FIELDS_WITH_VALUES_AND_ZERO: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        value: 'John',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField,
      ({
        id: 'PersonChildren',
        label: 'Children',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Number',
          type: 'Number'
        },
        value: 0
      }) as CaseField
    ];

    it('should return fields with embedded value as is', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES));
      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value empty', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = '';

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));
      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value `undefined`', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = undefined;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with embedded value `null`', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = null;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should NOT filter out fields with embedded value `false`', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_FALSE));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_FALSE);
    });

    it('should NOT filter out fields with embedded value `0`', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_ZERO));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_ZERO);
    });
  });

  describe('with value outside of fields', () => {
    const EXPECTED_FILTERED_FIELDS: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'John'
      }) as CaseField
    ];

    const FIELDS_WITHOUT_VALUES: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField
    ];

    const FIELDS_WITH_VALUES: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'John'
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        },
        value: 'Doe'
      }) as CaseField
    ];

    const VALUES_ALL = {
      PersonFirstName: 'John',
      PersonLastName: 'Doe'
    };

    const VALUES_AND_MISSING = {
      PersonFirstName: 'John'
    };

    it('should return fields with external value as fields with embedded value', () => {
      FIELDS_WITH_VALUES[1].value = 'Doe';

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_ALL));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should filter out fields with external value empty', () => {
      VALUES_AND_MISSING['PersonLastName'] = '';

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should filter out fields with external value `undefined`', () => {
      VALUES_AND_MISSING['PersonLastName'] = undefined;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should filter out fields with external value `null`', () => {
      VALUES_AND_MISSING['PersonLastName'] = null;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(EXPECTED_FILTERED_FIELDS);
    });

    it('should NOT filter out fields with external value `0`', () => {
      VALUES_AND_MISSING['PersonLastName'] = 0;
      FIELDS_WITH_VALUES[1].value = 0;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });

    it('should NOT filter out fields with external value `false`', () => {
      VALUES_AND_MISSING['PersonLastName'] = false;
      FIELDS_WITH_VALUES[1].value = false;

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITHOUT_VALUES, VALUES_AND_MISSING));

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES);
    });
  });

  describe('with complex type in fields', () => {
    const COMPLEX_WITH_CHILDREN: CaseField[] = [
      ({
        id: 'Person',
        label: 'Person',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Person',
          type: 'Complex',
          complex_fields: [
            ({
              id: 'PersonFirstName',
              label: 'First name',
              display_context: 'OPTIONAL',
              field_type: {
                id: 'Text',
                type: 'Text'
              },
              value: 'John'
            }) as CaseField
          ]
        }
      }) as CaseField
    ];

    const COMPLEX_WITHOUT_CHILDREN: CaseField[] = [
      ({
        id: 'Person',
        label: 'Person',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Person',
          type: 'Complex',
          complex_fields: []
        }
      }) as CaseField
    ];

    const COMPLEX_WITH_EMPTY_CHILDREN: CaseField[] = [
      ({
        id: 'Person',
        label: 'Person',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Person',
          type: 'Complex',
          complex_fields: [
            ({
              id: 'FirstName',
              label: 'First name',
              display_context: 'OPTIONAL',
              field_type: {
                id: 'Text',
                type: 'Text'
              },
              value: ''
            }) as CaseField
          ]
        }
      }) as CaseField
    ];

    const COMPLEX_WITH_EXTERNAL_VALUES: CaseField = ({
        id: 'Person',
        label: 'Person',
      display_context: 'OPTIONAL',
        field_type: {
          id: 'Person',
          type: 'Complex',
          complex_fields: [
            ({
              id: 'FirstNameContainerContainer',
              label: 'First name container container',
              display_context: 'OPTIONAL',
              field_type: {
                id: 'Complex',
                type: 'Complex',
                complex_fields: [
                  {
                    id: 'FirstNameContainer',
                    label: 'First name container',
                    display_context: 'OPTIONAL',
                    field_type: {
                      id: 'Complex',
                      type: 'Complex',
                      complex_fields: [
                        ({
                          id: 'FirstName',
                          label: 'First name',
                          display_context: 'OPTIONAL',
                          field_type: {
                            id: 'Text',
                            type: 'Text'
                          }
                        }) as CaseField
                      ]
                    }
                  }
                ]
              }
            }) as CaseField
          ]
        },
        value: {
          FirstNameContainerContainer: {
            FirstNameContainer: {
              FirstName: 'Doe'
            }
          }
        }
    }) as CaseField;

    const COMPLEX_WITH_EXTERNAL_VALUES_FOR_COLLECTIONS_TABLE: CaseField = ({
      id: 'Person',
      label: 'Person',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Person',
        type: 'Complex',
        complex_fields: [
          ({
            id: 'FirstNameContainerContainer',
            label: 'First name container container',
            display_context: 'OPTIONAL',
            field_type: {
              id: 'Complex',
              type: 'Complex',
              complex_fields: [
                ({
                  id: 'FirstNameContainer',
                  label: 'First name container',
                  display_context: 'OPTIONAL',
                  field_type: {
                    id: 'Complex',
                    type: 'Complex',
                    complex_fields: [
                      ({
                        id: 'FirstName',
                        label: 'First name',
                        display_context: 'OPTIONAL',
                        field_type: {
                          id: 'Text',
                          type: 'Text'
                        }
                      }) as CaseField
                    ]
                  }
                }) as CaseField
              ]
            }
          }) as CaseField
        ]
      },
      value: [{value: {
        FirstNameContainerContainer: {
          FirstNameContainer: {
            FirstName: 'Doe'
          }
        }
      }}]
    }) as CaseField;
    it('should NOT filter out Complex, even though Complex value itself is undefined but children have values', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITH_CHILDREN));

      expect(filteredFields).toEqual(COMPLEX_WITH_CHILDREN);
    });

    it('should filter out Complex without fields', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITHOUT_CHILDREN));

      expect(filteredFields).toEqual([]);
    });

    it('should filter out Complex when ALL children have empty values', () => {
      const filteredFields = fieldsFilter.transform(caseBuilder(COMPLEX_WITH_EMPTY_CHILDREN));

      expect(filteredFields).toEqual([]);
    });

    it('should NOT filter out Complex which has a great-grand-child with value', () => {
      const filteredFields = fieldsFilter.transform(COMPLEX_WITH_EXTERNAL_VALUES);

      expect(filteredFields.length).toEqual(1);
    });

    it('should deal with Array based values', () => {
      const filteredFields = fieldsFilter.transform(COMPLEX_WITH_EXTERNAL_VALUES_FOR_COLLECTIONS_TABLE, false , 0);

      expect(filteredFields.length).toEqual(1);
    });
  });

  describe('option to keep empty fields', () => {
    const FIELDS_WITH_VALUES_AND_MISSING: CaseField[] = [
      ({
        id: 'PersonFirstName',
        label: 'First name',
        value: 'John',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField,
      ({
        id: 'PersonLastName',
        label: 'Last name',
        display_context: 'OPTIONAL',
        field_type: {
          id: 'Text',
          type: 'Text'
        }
      }) as CaseField
    ];

    it('should not filter out fields with embedded value empty', () => {
      FIELDS_WITH_VALUES_AND_MISSING[1].value = '';

      const filteredFields = fieldsFilter.transform(caseBuilder(FIELDS_WITH_VALUES_AND_MISSING), true, undefined);

      expect(filteredFields).toEqual(FIELDS_WITH_VALUES_AND_MISSING);
    });
  });
});
