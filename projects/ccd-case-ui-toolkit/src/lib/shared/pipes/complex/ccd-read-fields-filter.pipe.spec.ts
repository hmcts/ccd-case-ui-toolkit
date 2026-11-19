import { FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';

function buildCaseField(id: string, properties: object, value?: any): CaseField {
  return Object.assign(new CaseField(), {
    id,
    ...properties,
    value
  });
}
function getComplexField(id: string, complexFields: CaseField[], value?: any): CaseField {
  return buildCaseField(id, {
    field_type: { id: 'Complex', type: 'Complex', complex_fields: complexFields }
  }, value);
}

function buildMockFormGroup(): any {
  return {
    value: {},
    parent: { getRawValue: () => ({ data: {} }) }
  } as any;
}

function buildNestedCollectionFixture(parentFieldValue: any, hasCollectionAncestor: boolean): { nestedComplexField: CaseField } {
  const childField: CaseField = buildCaseField('childField', {
    field_type: {
      complex_fields: [],
      id: 'Text',
      type: 'Text'
    },
    hidden: false,
    label: 'Child field',
    show_condition: 'parentField=\"Yes\"'
  }, null);

  const nestedComplexField: CaseField = buildCaseField('nestedComplex', {
    field_type: {
      complex_fields: [childField],
      id: 'NestedComplex',
      type: 'Complex'
    },
    hidden: false,
    label: 'Nested complex'
  }, parentFieldValue);

  const ancestor: CaseField = buildCaseField('0', {
    field_type: {
      complex_fields: [],
      id: 'NestedComplex',
      type: 'Complex'
    }
  }, parentFieldValue || {});

  const collectionParent: CaseField = buildCaseField('collectionParent', {
    field_type: {
      collection_field_type: {
        complex_fields: [],
        id: 'NestedComplex',
        type: 'Complex'
      },
      id: 'CollectionParent',
      type: 'Collection'
    },
    hidden: false,
    label: 'Collection parent'
  }, []);

  const nonCollectionParent: CaseField = buildCaseField('parent', {
    field_type: {
      complex_fields: [],
      id: 'ParentComplex',
      type: 'Complex'
    },
    hidden: false,
    label: 'Parent complex'
  }, {});

  nestedComplexField.parent = ancestor;
  ancestor.parent = hasCollectionAncestor ? collectionParent : nonCollectionParent;
  childField.parent = nestedComplexField;

  return { nestedComplexField };
}

describe('ReadFieldsFilterPipe', () => {
  const TEXT_FIELD: CaseField = buildCaseField('text', {
    field_type: { id: 'Text', type: 'Text' }
  }, null);
  const CASE_PAYMENT_HISTORY_VIEWER: CaseField = buildCaseField('payments', {
    field_type: { id: 'CasePaymentHistoryViewer', type: 'CasePaymentHistoryViewer' }
  }, null);
  const LABEL_FIELD: CaseField = buildCaseField('label', {
    field_type: { id: 'Label', type: 'Label' }, label: 'Label'
  }, null);

  const value = {
    type: 'INDIVIDUAL',
    individualFirstName: 'Aamir',
    individualLastName: 'Khan'
  };

  const complexCaseField: CaseField = buildCaseField('ViewApplicationTab', {
    display_context: 'COMPLEX',
    field_type: {
      complex_fields: [
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            fixed_list_items: [
              {code: 'INDIVIDUAL', label: 'Individual', order: '1'},
              {code: 'COMPANY', label: 'Company', order: '2'},
              {code: 'ORGANISATION', label: 'Organisation', order: '3'},
            ],
            id: 'FixedRadioList-PartyType',
            type: 'FixedRadioList-PartyType',
          },
          hidden: false,
          id: 'type',
          label: 'Claimant type',
          show_condition: null,
          value: null,
        },
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            id: 'Text',
            type: 'Text',
          },
          hidden: false,
          id: 'individualFirstName',
          label: 'First Name',
          show_condition: 'applicant1.type=\"INDIVIDUAL\"',
          value: null,
        },
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            id: 'Text',
            type: 'Text',
          },
          hidden: false,
          id: 'individualLastName',
          label: 'Last Name',
          show_condition: 'applicant1.type=\"INDIVIDUAL\"',
          value: null,
        }
      ],
      id: 'Party',
      type: 'Complex'
    },
    id: 'applicant1',
    label: 'Claimants details',
    show_condition: null
  }, value);

  const complexCaseField1: CaseField = buildCaseField('ViewApplicationTab', {
    display_context: 'COMPLEX',
    field_type: {
      complex_fields: [],
      id: 'Party',
      type: 'Text'
    },
    id: 'test',
    label: 'Claimants details',
    show_condition: null
  }, 'test1');

  const complexCaseField2: CaseField = buildCaseField('ViewApplicationTab', {
    display_context: 'COMPLEX',
    field_type: {
      complex_fields: [
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            id: 'YesOrNo',
            type: 'YesOrNo',
          },
          hidden: false,
          id: 'caseAccepted',
          label: 'Case Accepted?',
          show_condition: null,
          value: null,
        },
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            id: 'Date',
            type: 'Date',
          },
          hidden: false,
          id: 'dateAccepted',
          label: 'Date Accepted',
          show_condition: 'caseAccepted=\"No\"',
          value: null,
        }
      ],
      id: 'acceptOrRejectCase',
      type: 'Complex'
    },
    id: 'preAcceptCase',
    label: '',
    show_condition: null
  });

  const value1 = {
    addNewHearingLabel: null,
    allPartiesAttendHearingSameWayYesOrNo: 'No',
    localAuthorityHearingChannel: {
      list_items: [
        {
          code: 'INTER',
          label: 'In Person'
        },
        {
          code: 'NA',
          label: 'Not In Attendance'
        },
        {
          code: 'ONPPRS',
          label: 'On the Papers'
        },
        {
          code: 'TEL',
          label: 'Telephone'
        },
        {
          code: 'VID',
          label: 'Video'
        }
      ],
      value: null
    }
  };

  const complexCaseField3: CaseField = buildCaseField('hearing', {
    field_type: {
      complex_fields: [
        {
          display_context: 'OPTIONAL',
          field_type: {
            complex_fields: [],
            id: 'DynamicList',
            type: 'DynamicList',
          },
          hidden: false,
          id: 'localAuthorityHearingChannel',
          label: 'Local authority',
          list_items: [
            {
              code: 'INTER',
              label: 'In Person'
            },
            {
              code: 'NA',
              label: 'Not In Attendance'
            },
            {
              code: 'ONPPRS',
              label: 'On the Papers'
            },
            {
              code: 'TEL',
              label: 'Telephone'
            },
            {
              code: 'VID',
              label: 'Video'
            }
          ],
          show_condition: null,
          value: {
            list_items: [
              {
                code: 'INTER',
                label: 'In Person'
              },
              {
                code: 'NA',
                label: 'Not In Attendance'
              },
              {
                code: 'ONPPRS',
                label: 'On the Papers'
              },
              {
                code: 'TEL',
                label: 'Telephone'
              },
              {
                code: 'VID',
                label: 'Video'
              }
            ],
            value: null
          },
        },
        {
          display_context: 'HIDDEN',
          field_type: {
            complex_fields: [],
            id: 'Label',
            type: 'Label',
          },
          hidden: true,
          id: 'addNewHearingLabel',
          label: 'Add new Hearing',
          show_condition: null,
          value: undefined,
        },
        {
          display_context: 'MANDATORY',
          field_type: {
            complex_fields: [],
            id: 'YesOrNo',
            type: 'YesOrNo',
          },
          hidden: false,
          id: 'allPartiesAttendHearingSameWayYesOrNo',
          label: 'Will all parties attend the hearing in the same way?',
          show_condition: null,
          value: undefined,
        }
      ],
      id: 'HearingData',
      type: 'Complex'
    },
    id: '0',
    hidden: false,
    label: 'Hearing 1',
  }, value1);

  const METADATA: object = {
    ACCESS_GRANTED: 'STANDARD',
    ACCESS_PROCESS: 'NONE',
    CASE_REFERENCE: 1699282593769522,
    CASE_TYPE: 'Benefit',
    JURISDICTION: 'SSCS',
    STATE: 'readyToList'
  };

  const FORM_GROUP = new FormGroup({
    data: new FormGroup({
      type: new FormControl('ORGANISATION'),
      individualFirstName: new FormControl('Aamir'),
      individualLastName: new FormControl('Khan'),
      gender: new FormControl('Male'),
      address: new FormControl('street 1'),
      preAcceptCase: new FormGroup({
        caseAccepted: new FormControl('Yes'),
        dateAccepted: new FormControl('10/01/2023')
      })
    })
  });

  const FORM_GROUP1 = new FormGroup({
    data: new FormGroup({
      addNewHearingLabel: new FormControl(null),
      allPartiesAttendHearingSameWayYesOrNo: new FormControl('No'),
      localAuthorityHearingChannel: new FormControl({
        list_items: [
          {
            code: 'INTER',
            label: 'In Person'
          },
          {
            code: 'NA',
            label: 'Not In Attendance'
          },
          {
            code: 'ONPPRS',
            label: 'On the Papers'
          },
          {
            code: 'TEL',
            label: 'Telephone'
          },
          {
            code: 'VID',
            label: 'Video'
          }
        ],
        value: null
      })
    })
  });

  let pipe: ReadFieldsFilterPipe;

  beforeEach(() => {
    pipe = new ReadFieldsFilterPipe();
  });

  it('filters out null Text fields when keepEmpty is false', () => {
    const CF: CaseField = getComplexField('complex', [ TEXT_FIELD ], { text: null } );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(0);
  });

  it('retains null Text fields when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ TEXT_FIELD ], { text: null } );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(TEXT_FIELD.id);
  });

  it('retains null CasePaymentHistoryViewer fields when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ CASE_PAYMENT_HISTORY_VIEWER ], { payments: null } );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(CASE_PAYMENT_HISTORY_VIEWER.id);
  });

  it('retains null CasePaymentHistoryViewer fields even when keepEmpty is false', () => {
    const CF: CaseField = getComplexField('complex', [ CASE_PAYMENT_HISTORY_VIEWER ], { payments: null } );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(CASE_PAYMENT_HISTORY_VIEWER.id);
  });

  it('retains Label fields with a label when keepEmpty is true', () => {
    const CF: CaseField = getComplexField('complex', [ LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(LABEL_FIELD.id);
  });

  it('retains Label fields without a label when keepEmpty is true', () => {
    const NO_LABEL_FIELD: CaseField = buildCaseField('label', {
      field_type: { id: 'Label', type: 'Label' }
    }, null);
    const CF: CaseField = getComplexField('complex', [ NO_LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, true);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].id).toEqual(NO_LABEL_FIELD.id);
  });

  it('filters out Label fields without a label when keepEmpty is false', () => {
    const NO_LABEL_FIELD: CaseField = buildCaseField('label', {
      field_type: { id: 'Label', type: 'Label' }
    }, null);
    const CF: CaseField = getComplexField('complex', [ NO_LABEL_FIELD ], {} );
    const RESULT: CaseField[] = pipe.transform(CF, false);
    expect(RESULT).toBeDefined();
    expect(RESULT.length).toEqual(0);
  });

  it('hides the parent if children are not defined', () => {

    const caseField: CaseField = buildCaseField('ViewApplicationTab', {
      field_type: {
        id: 'ViewApplicationTab',
        type: 'Complex',
        complex_fields: [
          {
            id: 'factorsParenting',
            label: 'Factors affecting parenting',
            field_type: {
              id: 'FactorsParenting',
              type: 'Complex',
              complex_fields: [
                {
                  id: 'pageHeader',
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'Label',
                    max: null,
                    min: null,
                    type: 'Label'
                  },
                  label: 'Is there any evidence of any of the following affecting ability to parent?',
                  show_condition: null,
                  retain_hidden_value: null,
                  security_classification: 'PUBLIC'
                },
                {
                  id: 'alcoholDrugAbuse',
                  field_type: {
                    collection_field_type: null,
                    complex_fields: [],
                    fixed_list_items: [],
                    id: 'YesOrNo',
                    max: null,
                    min: null,
                    type: 'YesOrNo'
                  },
                  label: 'Alcohol or drug abuse',
                  show_condition: null,
                  retain_hidden_value: null,
                  security_classification: 'PUBLIC'
                }
              ]
            }
          }
        ],
      },
      label: 'View application',
      value: {
        factorsParenting: {
          alcoholDrugAbuse: null,
          alcoholDrugAbuseReason: null,
          anythingElse: null,
          anythingElseReason: null,
          domesticViolence: null,
          domesticViolenceReason: null,
        }
      }
    }, null);
    const RESULT: CaseField[] = pipe.transform(caseField, false, undefined, true);
    expect(RESULT.length).toEqual(0);
  });

  it('should evaluate showcondition and set the hidden property of field to false when value doesn\'t match within complex field', () => {
    const RESULT: CaseField[] = pipe.transform(complexCaseField, false, undefined, true);
    expect(RESULT.length).toEqual(3);
    expect(RESULT[1].hidden).toEqual(false);
    expect(RESULT[2].hidden).toEqual(false);
  });
  it('should evaluate showcondition and set the hidden property of field to true when value doesn\'t match within complex field', () => {
    complexCaseField.value = {
      type: 'ORGANISATION',
      individualFirstName: 'Aamir',
      individualLastName: 'Khan'
    };
    const RESULT: CaseField[] = pipe.transform(complexCaseField, false, undefined, true);
    expect(RESULT.length).toEqual(3);
    expect(RESULT[1].hidden).toEqual(true);
    expect(RESULT[2].hidden).toEqual(true);
  });
  it('should return blank array if we sent null as input parameters', () => {
    const RESULT: CaseField[] = pipe.transform(null);
    expect(RESULT.length).toEqual(0);
  });
  it('should return blank array if we sent blank array for complex field type', () => {
    const RESULT: CaseField[] = pipe.transform(complexCaseField1);
    expect(RESULT.length).toEqual(0);
  });
  it('should evaluate showcondition and set the hidden property of field to true when value doesn\'t match within complex field even Formgroup passed', () => {
    complexCaseField.value = {
      type: 'ORGANISATION',
      individualFirstName: 'Aamir',
      individualLastName: 'Khan'
    };
    const RESULT: CaseField[] = pipe.transform(complexCaseField, false, undefined, true, FORM_GROUP.controls['data'], undefined, 'address_0');
    expect(RESULT.length).toEqual(3);
    expect(RESULT[1].hidden).toEqual(true);
    expect(RESULT[2].hidden).toEqual(true);
  });
  it('should evaluate showcondition and set the hidden property of field to true when value doesn\'t match within complex field even Formgroup passed with idPrefix passed as empty string', () => {
    complexCaseField2.value = {
      caseAccepted: 'Yes',
      dateAccepted: '10/01/2023'
    };
    const RESULT: CaseField[] = pipe.transform(complexCaseField2, false, undefined, true, FORM_GROUP.controls['data'], undefined, '');
    expect(RESULT.length).toEqual(2);
    expect(RESULT[0].hidden).toEqual(false);
    expect(RESULT[1].hidden).toEqual(true);
  });
  it('should evaluate showcondition and set the hidden property of field to false when value match within complex field even Formgroup passed with idPrefix passed as empty string', () => {
    complexCaseField2.value = {
      caseAccepted: 'Yes',
      dateAccepted: '10/01/2023'
    };
    complexCaseField2.field_type.complex_fields[1].show_condition = 'caseAccepted=\"Yes\"';
    const RESULT: CaseField[] = pipe.transform(complexCaseField2, false, undefined, true, FORM_GROUP.controls['data'], undefined, '');
    expect(RESULT.length).toEqual(2);
    expect(RESULT[0].hidden).toEqual(false);
    expect(RESULT[1].hidden).toEqual(false);
  });
  it('should use the collection item parent value when it is available', () => {
    const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
    const formGroup = buildMockFormGroup();

    const RESULT: CaseField[] = pipe.transform(nestedComplexField, true, undefined, true, formGroup, 'parent_value', '');
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].hidden).toEqual(false);
  });
  it('should merge collection item parent value with current complex values for show conditions', () => {
    const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
    nestedComplexField.value = { nestedField: 'Show' };
    nestedComplexField.field_type.complex_fields[0].show_condition = 'nestedField=\"Show\"';
    const formGroup = buildMockFormGroup();

    const RESULT: CaseField[] = pipe.transform(nestedComplexField, true, undefined, true, formGroup, 'parent_value', '');
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].hidden).toEqual(false);
  });
  it('should fall back to the complex values when the collection item parent value is blank', () => {
    const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
    nestedComplexField.parent!.value = {};
    const formGroup = buildMockFormGroup();

    const RESULT: CaseField[] = pipe.transform(nestedComplexField, true, undefined, true, formGroup, 'parent_value', '');
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].hidden).toEqual(false);
  });
  it('should walk ancestors and return undefined when there is no collection ancestor', () => {
    const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, false);
    const formGroup = buildMockFormGroup();

    const RESULT: CaseField[] = pipe.transform(nestedComplexField, true, undefined, true, formGroup, 'parent_value', '');
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].hidden).toEqual(false);
  });
  it('should fall back to the complex values when the collection item lookup returns empty object', () => {
    const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
    nestedComplexField.parent = nestedComplexField.parent?.parent;
    const formGroup = buildMockFormGroup();

    const RESULT: CaseField[] = pipe.transform(nestedComplexField, true, undefined, true, formGroup, 'parent_value', '');
    expect(RESULT.length).toEqual(1);
    expect(RESULT[0].hidden).toEqual(false);
  });
  it('should evaluate showcondition and set the hidden property of field to false when value match with MetaData field', () => {
    const formField = FORM_GROUP.controls['data'] as FormGroup;
    const allFieldValues = Object.assign(METADATA, formField.value);
    complexCaseField2.value = {
      caseAccepted: 'Yes',
      dateAccepted: '10/01/2023'
    };
    complexCaseField2.field_type.complex_fields[1].show_condition = 'STATE=\"readyToList\"';
    const RESULT: CaseField[] = pipe.transform(complexCaseField2, false, undefined, true, allFieldValues);
    expect(RESULT.length).toEqual(2);
    expect(RESULT[0].hidden).toEqual(false);
    expect(RESULT[1].hidden).toEqual(false);
  });
  it('should evaluate showcondition and set the hidden property of field to true when value doesn\'t match with MetaData field', () => {
    const formField = FORM_GROUP.controls['data'] as FormGroup;
    const allFieldValues = Object.assign(METADATA, formField.value);
    complexCaseField2.value = {
      caseAccepted: 'Yes',
      dateAccepted: '10/01/2023'
    };
    complexCaseField2.field_type.complex_fields[1].show_condition = 'STATE=\"Do Not Show\"';
    const RESULT: CaseField[] = pipe.transform(complexCaseField2, false, undefined, true, allFieldValues);
    expect(RESULT.length).toEqual(2);
    expect(RESULT[0].hidden).toEqual(false);
    expect(RESULT[1].hidden).toEqual(true);
  });
  describe('isolated collection show-condition contexts', () => {
    function hearingFixture(dateType = 'DATE_RANGE') {
      const dates = ['fromDate', 'toDate', 'date'].map(id => buildCaseField(id, {
        field_type: { id: 'Date', type: 'Date' },
        show_condition: `unavailableDateType="${id === 'date' ? 'SINGLE_DATE' : 'DATE_RANGE'}"`
      }));
      const item = getComplexField('0', dates, {
        fromDate: '2026-01-01', toDate: '2026-01-02', date: '2026-01-01', unavailableDateType: dateType
      });
      const collection = buildCaseField('smallClaimUnavailableDate', {
        field_type: { id: 'Collection', type: 'Collection', collection_field_type: item.field_type }
      }, [{ id: 'item-1', value: item.value }]);
      item.parent = collection;
      dates.forEach(field => field.parent = item);
      const respondent = getComplexField('respondent1DQHearingSmallClaim', [], {
        unavailableDatesRequired: 'Yes', smallClaimUnavailableDate: collection.value
      });
      const applicant = getComplexField('applicant1DQSmallClaimHearing', [], {
        unavailableDatesRequired: 'No', smallClaimUnavailableDate: undefined
      });
      collection.parent = respondent;
      const data = {
        respondent1DQHearingSmallClaim: respondent.value,
        applicant1DQSmallClaimHearing: applicant.value
      };
      const form = new FormGroup({ data: new FormControl(data) });
      const renderParent = (field: CaseField) => pipe.transform(field, false, undefined, true,
        form.controls.data, 'parent_value', '');
      const renderItem = (target = item) => pipe.transform(target, false, undefined, true, form.controls.data,
        `parent_smallClaimUnavailableDate_${target.id}_value`, `smallClaimUnavailableDate_${target.id}_`);
      return { item, applicant, respondent, data, renderParent, renderItem };
    }

    [true, false].forEach(applicantFirst => {
      ['DATE_RANGE', 'SINGLE_DATE'].forEach(dateType => {
        it(`should evaluate ${dateType} locally with applicantFirst=${applicantFirst}`, () => {
          const fixture = hearingFixture(dateType);
          const parents = applicantFirst ? [fixture.applicant, fixture.respondent] : [fixture.respondent, fixture.applicant];
          parents.forEach(fixture.renderParent);
          const result = fixture.renderItem();
          expect(result.map(field => field.hidden)).toEqual(dateType === 'DATE_RANGE' ? [false, false, true] : [true, true, false]);
          expect(Object.keys(fixture.data)).toEqual(['respondent1DQHearingSmallClaim', 'applicant1DQSmallClaimHearing']);
          expect(fixture.data.respondent1DQHearingSmallClaim.smallClaimUnavailableDate[0].value).toBe(fixture.item.value);
          // A subsequent change-detection pass must not depend on the previous render order.
          parents.reverse().forEach(fixture.renderParent);
          expect(fixture.renderItem().map(field => field.hidden)).toEqual(result.map(field => field.hidden));
        });
      });
    });

    it('should evaluate an item before either parent has been rendered', () => {
      const fixture = hearingFixture();
      expect(fixture.renderItem().map(field => field.hidden)).toEqual([false, false, true]);
    });

    it('should keep separate collection items independent', () => {
      const fixture = hearingFixture();
      expect(fixture.renderItem()[0].hidden).toBe(false);
      const secondItem = getComplexField('1', fixture.item.field_type.complex_fields, {
        ...fixture.item.value, unavailableDateType: 'SINGLE_DATE'
      });
      secondItem.parent = fixture.item.parent;
      expect(fixture.renderItem(secondItem).map(field => field.hidden)).toEqual([true, true, false]);
      expect(fixture.renderItem().map(field => field.hidden)).toEqual([false, false, true]);
    });

    it('should preserve qualified collection conditions and explicitly hidden fields', () => {
      const fixture = hearingFixture();
      fixture.item.field_type.complex_fields[0].show_condition = 'smallClaimUnavailableDate.unavailableDateType="DATE_RANGE"';
      fixture.item.field_type.complex_fields[1].display_context = 'HIDDEN';
      expect(fixture.renderItem().map(field => field.hidden)).toEqual([false, true, true]);
    });

    it('should not show dates when the item has no date type', () => {
      const fixture = hearingFixture();
      fixture.item.value.unavailableDateType = undefined;
      expect(fixture.renderItem().map(field => field.hidden)).toEqual([true, true, true]);
    });

    it('should preserve root conditions for prefixed complex fields that are not collection items', () => {
      const child = buildCaseField('detail', {
        field_type: { id: 'Text', type: 'Text' }, show_condition: 'globalFlag="Yes"'
      });
      const complex = getComplexField('complex', [child], { detail: 'Value' });
      const form = new FormGroup({ data: new FormControl({ globalFlag: 'Yes' }) });
      const result = pipe.transform(complex, false, undefined, true, form.controls.data, 'parent_complex_value', 'complex_');
      expect(result[0].hidden).toBe(false);
    });

    it('should not mutate the shared form data even when merging undefined values', () => {
      const fixture = hearingFixture();
      Object.freeze(fixture.data);
      expect(() => fixture.renderParent(fixture.applicant)).not.toThrow();
    });

    it('should preserve nested collection parent values without mutating the parent item', () => {
      const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
      const parentValue = Object.freeze(nestedComplexField.parent.value);
      nestedComplexField.value = { nestedField: 'Show' };
      nestedComplexField.field_type.complex_fields[0].show_condition = 'parentField="Yes" AND nestedField="Show"';
      const result = pipe.transform(nestedComplexField, true, undefined, true, buildMockFormGroup(), 'parent_value', '');
      expect(result[0].hidden).toBe(false);
      expect(parentValue).toEqual({ parentField: 'Yes' });
    });

    it('should not mutate shared data when the collection parent value is empty', () => {
      const { nestedComplexField } = buildNestedCollectionFixture({ parentField: 'Yes' }, true);
      nestedComplexField.parent.value = {};
      const data = Object.freeze({ unrelated: 'value' });
      const form = new FormGroup({ data: new FormControl(data) });
      const result = pipe.transform(nestedComplexField, true, undefined, true, form.controls.data, 'parent_value', '');
      expect(result[0].hidden).toBe(false);
      expect(data).toEqual({ unrelated: 'value' });
    });
  });

  it('should remove dynamic list field if its value is null', () => {
    const formField = FORM_GROUP1.controls['data'] as FormGroup;
    const allFieldValues = Object.assign(METADATA, formField.value);
    const RESULT: CaseField[] = pipe.transform(complexCaseField3, false, undefined, true, allFieldValues);
    expect(RESULT.length).toEqual(2);
  });
});
