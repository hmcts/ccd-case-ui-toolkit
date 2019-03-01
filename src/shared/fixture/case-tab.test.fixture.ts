import { CaseTab, FieldType } from '../domain';
import { newCaseField } from './case-field.test.fixture';
import { createFieldType } from './shared.test.fixture';

export let createCaseTabArray = () => {
  const tab1 = new CaseTab();

  tab1.id = 'AddressTab';
  tab1.label = 'Address';
  tab1.order = 2;
  tab1.fields = [];
  tab1.show_condition = 'PersonFirstName="Jane"';

  const tab2 = new CaseTab();

  tab2.id = 'NameTab';
  tab2.label = 'Name';
  tab2.order = 1;
  tab2.fields = [
    newCaseField('PersonFirstName', 'First name', null, null, 'OPTIONAL', 2)
      .withValue('Janet').withShowCondition('').build(),
    newCaseField('PersonLastName', 'Last name', null, null, 'OPTIONAL', 1)
      .withValue('Parker').withShowCondition('PersonFirstName="Jane*"').build(),
    newCaseField('PersonComplex', 'Complex field', null,
      createFieldType('Complex', 'Complex', [], new FieldType()), 'OPTIONAL', 3)
      .withValue('Janet').withShowCondition('PersonFirstName="Park"').build(),
  ];
  tab2.show_condition = 'PersonFirstName="Janet"';

  const tab3 = new CaseTab();
  tab3.id = 'SomeTab';
  tab3.label = 'Some Tab';
  tab3.order = 3;
  tab3.fields = [];
  tab3.show_condition = '';

  return [tab1, tab2, tab3];
};
