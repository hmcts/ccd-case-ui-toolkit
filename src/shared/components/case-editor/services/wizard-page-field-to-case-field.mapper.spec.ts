import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';
import { CaseEventTrigger } from '../../../domain';
import {
  createCaseEventTrigger,
  createCaseField,
  createComplexFieldOverride,
  createFieldType,
  createHiddenComplexFieldOverride,
  createWizardPage,
  createWizardPageField,
  textFieldType
} from '../../../fixture/shared.test.fixture';
import { ShowCondition } from '../../../directives/conditional-show/domain';

describe('WizardPageFieldToCaseFieldMapper', () => {

  let wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper;

  const CASE_FIELDS = [
    createCaseField('debtorName', 'Debtor name', '', textFieldType(), null),
    createCaseField('finalReturn', 'Final return', '',
      createFieldType('Return', 'Complex', [
        createCaseField('addressAttended',
          'Address Attended',
          'Address Attended hint text',
          createFieldType('AddressUK', 'Complex', [
            createCaseField('AddressLine1', 'Building and Street', 'hint 1', createFieldType('TextMax150', 'Text', []), null),
            createCaseField('AddressLine2', '', 'hint 2', createFieldType('TextMax50', 'Text', []), null),
            createCaseField('PostCode', 'Postcode/Zipcode', 'hint 3', createFieldType('TextMax14', 'Text', []), null)
          ]),
          null
        )
      ]),
      'COMPLEX')
  ];

  const WIZARD_PAGE = createWizardPage('FinalReturnfinalReturn', 'Final Return', 1,
      [
        createWizardPageField('debtorName', 2, null, 'MANDATORY', []),
        createWizardPageField('finalReturn', 1, null, 'COMPLEX', [
          createComplexFieldOverride('finalReturn.addressAttended.AddressLine1',
            3,
            'MANDATORY',
            'House number attended altered',
            'Altered hint text',
            ''),
          createHiddenComplexFieldOverride('finalReturn.addressAttended.AddressLine2'),
          createComplexFieldOverride('finalReturn.addressAttended.PostCode',
            1,
            'OPTIONAL',
            'Postcode attended',
            'Enter the postcode',
            'debtorName="Some name"')
        ])
      ],
      [], null, new ShowCondition(null));

  const EVENT_TRIGGER_RESPONSE: CaseEventTrigger = createCaseEventTrigger('FinalReturn',
    'Final Return',
    '1547555344187688',
    false,
    CASE_FIELDS,
    [WIZARD_PAGE]
  );

  beforeEach(() => {
    wizardPageFieldToCaseFieldMapper = new WizardPageFieldToCaseFieldMapper();
  });

  it('should map wizardPageFields using complex_field_overrides data', () => {

    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE.wizard_page_fields, CASE_FIELDS);
    console.log(JSON.stringify(caseFields, null, 2));

    let debtorName = caseFields[0];

    expect(debtorName.hidden).toBeFalsy('debtorName.hidden should be undefined');
    expect(debtorName.display_context).toEqual('MANDATORY');
    expect(debtorName.id).toEqual('debtorName');
    expect(debtorName.order).toEqual(2);
    expect(debtorName.show_condition).toBeUndefined('debtorName.show_condition should be undefined');

    let finalReturn = caseFields[1];
    expect(finalReturn.order).toEqual(1);

    let addressUK = finalReturn.field_type.complex_fields[0];
    let addressLine1 = addressUK.field_type.complex_fields.find(e => e.id === 'AddressLine1');
    let addressLine2 = addressUK.field_type.complex_fields.find(e => e.id === 'AddressLine2');
    let postCode = addressUK.field_type.complex_fields.find(e => e.id === 'PostCode');

    expect(addressLine1.hidden).toBeFalsy('addressLine1.hidden should be undefined');
    expect(addressLine1.display_context).toEqual('MANDATORY');
    expect(addressLine1.label).toEqual('House number attended altered');
    expect(addressLine1.hint_text).toEqual('Altered hint text');
    expect(addressLine1.order).toEqual(3);
    expect(addressLine1.show_condition).toBeUndefined('addressLine1.show_condition should be undefined');

    expect(addressLine2.hidden).toEqual(true);

    expect(postCode.hidden).toBeFalsy('postCode.hidden should be undefined');
    expect(postCode.display_context).toEqual('OPTIONAL');
    expect(postCode.label).toEqual('Postcode attended');
    expect(postCode.hint_text).toEqual('Enter the postcode');
    expect(postCode.order).toEqual(1);
    expect(postCode.show_condition).toEqual('debtorName="Some name"');
  });
});
