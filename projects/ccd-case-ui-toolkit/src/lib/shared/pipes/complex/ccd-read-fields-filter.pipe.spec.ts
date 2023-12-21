import { FormControl, FormGroup } from '@angular/forms';
import { CaseField } from '../../domain/definition/case-field.model';
import { ReadFieldsFilterPipe } from './ccd-read-fields-filter.pipe';

function buildCaseField(id: string, properties: object, value?: any): CaseField {
  return ({
    id,
    ...properties,
    value
  }) as CaseField;
}
function getComplexField(id: string, complexFields: CaseField[], value?: any): CaseField {
  return buildCaseField(id, {
    field_type: { id: 'Complex', type: 'Complex', complex_fields: complexFields }
  }, value);
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
  it('should evaluate showcondition and set the hidden property of field to false when value match with MetaData field', () => {
    const formField = FORM_GROUP.controls['data'].value;
    const allFieldValues = Object.assign(METADATA, formField);
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
    const formField = FORM_GROUP.controls['data'].value;
    const allFieldValues = Object.assign(METADATA, formField);
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
  it('should remove dynamic list field if on its value is null', () => {
    const formField = FORM_GROUP1.controls['data'].value;
    const allFieldValues = Object.assign(METADATA, formField);
    const RESULT: CaseField[] = pipe.transform(complexCaseField3, false, undefined, true, allFieldValues);
    expect(RESULT.length).toEqual(2);
  });
});
