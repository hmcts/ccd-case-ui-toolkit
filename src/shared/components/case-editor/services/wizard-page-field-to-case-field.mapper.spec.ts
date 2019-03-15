import { WizardPageFieldToCaseFieldMapper } from './wizard-page-field-to-case-field.mapper';
import {
  createCaseField,
  createComplexFieldOverride,
  createFieldType,
  createFixedListFieldType,
  createHiddenComplexFieldOverride,
  createWizardPage,
  createWizardPageField,
  textFieldType
} from '../../../fixture/shared.test.fixture';
import { ShowCondition } from '../../../directives/conditional-show/domain';

describe('WizardPageFieldToCaseFieldMapper', () => {

  let wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper;
  const INCOMPLETE_SHOW_CONDITION = 'AddressLine2="test"';

  const CASE_FIELDS = [
    createCaseField('debtorName', 'Debtor name', '', textFieldType(), null),
    createCaseField('finalReturn', 'Final return', '',
      createFieldType('Return', 'Complex', [
        createCaseField('addressAttended',
          'Address Attended',
          'Address Attended hint text',
          createFieldType('AddressUK', 'Complex', [
            createCaseField('AddressLine1', 'Building and Street', 'hint 1',
              createFieldType('TextMax150', 'Text', []),
              null, 1, INCOMPLETE_SHOW_CONDITION),
            createCaseField('AddressLine2', '', 'hint 2', createFieldType('TextMax50', 'Text', []), null),
            createCaseField('AddressLine3', '', 'hint 3', createFieldType('TextMax50', 'Text', []), null),
            createCaseField('PostCode', 'Postcode/Zipcode', 'hint 3', createFieldType('TextMax14', 'Text', []), null)
          ]),
          null
        ),
        createCaseField('testCaseLink', 'Case Link test', '', createFieldType('CaseLink', 'Complex', [
          createCaseField('CaseReference', 'Case Reference', null, createFieldType('TextCaseReference', 'Text', []), null)
        ]), null),
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
          createHiddenComplexFieldOverride('finalReturn.addressAttended.AddressLine3'),
          createComplexFieldOverride('finalReturn.addressAttended.PostCode',
            1,
            'OPTIONAL',
            'Postcode attended',
            'Enter the postcode',
            'debtorName="Some name"')
        ])
      ],
      [], null, new ShowCondition(null));

  const WIZARD_PAGE_WITH_HIDDEN_CASE_LINK = createWizardPage('FinalReturnfinalReturn', 'Final Return', 1,
      [
        createWizardPageField('debtorName', 2, null, 'MANDATORY', []),
        createWizardPageField('finalReturn', 1, null, 'COMPLEX', [
          createHiddenComplexFieldOverride('finalReturn.testCaseLink.CaseReference')
        ])
      ],
      [], null, new ShowCondition(null));

  beforeEach(() => {
    wizardPageFieldToCaseFieldMapper = new WizardPageFieldToCaseFieldMapper();
  });

  it('should map wizardPageFields using complex_field_overrides data', () => {

    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE.wizard_page_fields, CASE_FIELDS);

    let debtorName = caseFields[0];

    expect(debtorName.hidden).toBeFalsy('debtorName.hidden should be undefined');
    expect(debtorName.display_context).toEqual('MANDATORY');
    expect(debtorName.id).toEqual('debtorName');
    expect(debtorName.show_condition).toBeUndefined('debtorName.show_condition should be undefined');

    let finalReturn = caseFields[1];

    expect(finalReturn.field_type.complex_fields.length).toBe(2);
    let addressAttended = finalReturn.field_type.complex_fields[0];
    let addressLine1 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine1');
    let addressLine2 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine2');
    let addressLine3 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine3');
    let postCode = addressAttended.field_type.complex_fields.find(e => e.id === 'PostCode');

    expect(addressLine1.hidden).toBeFalsy('addressLine1.hidden should be undefined');
    expect(addressLine1.display_context).toEqual('MANDATORY');
    expect(addressLine1.label).toEqual('House number attended altered');
    expect(addressLine1.hint_text).toEqual('Altered hint text');

    expect(addressLine2.hidden).toEqual(true);
    expect(addressLine3.hidden).toEqual(true);

    expect(postCode.hidden).toBeFalsy('postCode.hidden should be undefined');
    expect(postCode.display_context).toEqual('OPTIONAL');
    expect(postCode.label).toEqual('Postcode attended');
    expect(postCode.hint_text).toEqual('Enter the postcode');
    expect(postCode.show_condition).toEqual('debtorName="Some name"');

    let caseLink = finalReturn.field_type.complex_fields[1];
    expect(caseLink.hidden).toBeFalsy('caseLink.hidden should be undefined');
    expect(caseLink.display_context).toEqual('OPTIONAL');
    expect(caseLink.label).toEqual('Case Link test');
    expect(caseLink.hint_text).toEqual('First name hint text');
    expect(caseLink.show_condition).toBeUndefined('caseLink.show_condition should be undefined');
  });

  it('should set order on all caseFields', () => {
    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE.wizard_page_fields, CASE_FIELDS);

    let debtorName = caseFields.find(e => e.id === 'debtorName');
    let finalReturn = caseFields.find(e => e.id === 'finalReturn');
    let addressAttended = finalReturn.field_type.complex_fields.find(e => e.id === 'addressAttended');
    let addressLine1 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine1');
    let addressLine2 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine2');
    let addressLine3 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine3');
    let postCode = addressAttended.field_type.complex_fields.find(e => e.id === 'PostCode');
    let caseLink = finalReturn.field_type.complex_fields.find(e => e.id === 'testCaseLink');

    expect(finalReturn.order).toEqual(1); // overridden from 2
    expect(debtorName.order).toEqual(2); // overridden from 1

    expect(addressAttended.order).toEqual(1);

    expect(addressLine1.order).toEqual(3); // overridden from 1
    expect(addressLine2.order).toEqual(2);
    expect(addressLine3.order).toEqual(3);
    expect(postCode.order).toEqual(1); // overridden from 3

    expect(caseLink.order).toEqual(2);
  });

  it('should hide caseLink both parent and a child', () => {

    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE_WITH_HIDDEN_CASE_LINK.wizard_page_fields, CASE_FIELDS);

    let finalReturn = caseFields[1];
    let caseLink = finalReturn.field_type.complex_fields[1];
    expect(caseLink.hidden).toBe(true, 'finalReturn.testCaseLink.hidden should be true');
    const caseReference = caseLink.field_type.complex_fields[0];
    expect(caseReference.hidden).toBe(true, 'finalReturn.testCaseLink.CaseReference.hidden should be true');
  });

  it('should fix INCOMPLETE_SHOW_CONDITION path for complex fields caseField', () => {

    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE_WITH_HIDDEN_CASE_LINK.wizard_page_fields, CASE_FIELDS);

    let finalReturn = caseFields[1];
    let addressAttended = finalReturn.field_type.complex_fields[0];
    let addressLine1 = addressAttended.field_type.complex_fields.find(e => e.id === 'AddressLine1');

    expect(addressLine1.show_condition).toBe('finalReturn.addressAttended.' + INCOMPLETE_SHOW_CONDITION)
  });
});

describe('WizardPageFieldToCaseFieldMapper - nested Collection of Collection type', () => {

  let wizardPageFieldToCaseFieldMapper: WizardPageFieldToCaseFieldMapper;

  const DATE_TEXT_FIELD = createCaseField('date', 'Date', '', textFieldType(), null);
  const DESCRIPTION_TEXT_FIELD = createCaseField('description', 'Description', '', textFieldType(), null);
  const TIMELINE_EVENT_COMPLEX = createFieldType('TimelineEvent', 'Complex', [DATE_TEXT_FIELD, DESCRIPTION_TEXT_FIELD]);
  const TIMELINE_EVENTS_COLLECTION = createCaseField('defendantTimeLineEvents', 'Timeline Events', '',
    createFieldType('defendantTimeLineEvents-acd64b3a', 'Collection', [], TIMELINE_EVENT_COMPLEX), null);
  const RESPONSE_SUBJECT_LIST_ITEM = createCaseField('responseSubject', 'Who is this response from?', '',
    createFixedListFieldType('ResponseSubject',
      [{code: 'Res_CLAIMANT', label: 'Claimant response'}, {code: 'Res_DEFENDANT', label: 'Defendant response'}]),
    null);
  const PARTY_NAME_TEXT_FIELD = createCaseField('partyName', 'Defendant Name', '', textFieldType(), null);
  const RESPONDENT_COMPLEX_FIELD_TYPE = createFieldType('Respondent', 'Complex',
    [PARTY_NAME_TEXT_FIELD, RESPONSE_SUBJECT_LIST_ITEM, TIMELINE_EVENTS_COLLECTION]);

  const CASE_FIELDS = [
    createCaseField('reason', 'Reason', '', textFieldType(), null),
    createCaseField('respondents', 'Defendants', '',
      createFieldType('respondents-33e0ff77', 'Collection', [], RESPONDENT_COMPLEX_FIELD_TYPE), 'COMPLEX')];

  const WIZARD_PAGE = createWizardPage('AdmitAllPaper1', '', 1,
    [
      createWizardPageField('reason', 1, null, 'MANDATORY', []),
      createWizardPageField('respondents', 1, null, 'COMPLEX', [
        createComplexFieldOverride('respondents.responseSubject',
          1,
          'OPTIONAL',
          'Subject',
          'Altered hint text',
          ''),
        createHiddenComplexFieldOverride('respondents.partyName'),
        createHiddenComplexFieldOverride('respondents.defendantTimeLineEvents.date'),
        createHiddenComplexFieldOverride('respondents.defendantTimeLineEvents.description')
      ])
    ],
    [], null, new ShowCondition(null));

  beforeEach(() => {
    wizardPageFieldToCaseFieldMapper = new WizardPageFieldToCaseFieldMapper();
  });

  it('should map wizardPageFields using complex_field_overrides data', () => {

    let caseFields = wizardPageFieldToCaseFieldMapper.mapAll(WIZARD_PAGE.wizard_page_fields, CASE_FIELDS);

    let reason = caseFields[0];

    expect(reason.hidden).toBeFalsy('debtorName.hidden should be undefined');
    expect(reason.display_context).toEqual('MANDATORY');
    expect(reason.id).toEqual('reason');
    expect(reason.show_condition).toBeUndefined('debtorName.show_condition should be undefined');

    let respondents = caseFields[1];

    expect(respondents.field_type.collection_field_type.complex_fields.length).toBe(3);

    let responseSubject = respondents.field_type.collection_field_type.complex_fields.find(e => e.id === 'responseSubject');
    let partyName = respondents.field_type.collection_field_type.complex_fields.find(e => e.id === 'partyName');
    let defendantTimeLineEvents = respondents.field_type.collection_field_type.complex_fields.find(e => e.id === 'defendantTimeLineEvents');

    expect(responseSubject.hidden).toBeFalsy('responseSubject.hidden should be undefined');
    expect(responseSubject.order).toEqual(1);
    expect(responseSubject.display_context).toEqual('OPTIONAL');
    expect(responseSubject.label).toEqual('Subject');
    expect(responseSubject.hint_text).toEqual('Altered hint text');

    expect(partyName.hidden).toEqual(true);
    expect(defendantTimeLineEvents.hidden).toEqual(true);

    let timelineEventDate = defendantTimeLineEvents.field_type.collection_field_type.complex_fields.find(e => e.id === 'date');
    let timelineEventDescription = defendantTimeLineEvents
      .field_type.collection_field_type.complex_fields.find(e => e.id === 'description');

    expect(timelineEventDate.hidden).toEqual(true);
    expect(timelineEventDescription.hidden).toEqual(true);
  });
});
