import { CaseTab } from '../domain';

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
    {
      id: 'PersonFirstName',
      label: 'First name',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Text',
        type: 'Text'
      },
      order: 2,
      value: 'Janet',
      show_condition: ''
    },
    {
      id: 'PersonLastName',
      label: 'Last name',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Text',
        type: 'Text'
      },
      order: 1,
      value: 'Parker',
      show_condition: 'PersonFirstName="Jane*"'
    },
    {
      id: 'PersonComplex',
      label: 'Complex field',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Complex',
        type: 'Complex',
        complex_fields: []
      },
      order: 3,
      show_condition: 'PersonFirstName="Park"'
    }
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
