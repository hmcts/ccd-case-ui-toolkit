import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { of } from 'rxjs';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { OrganisationConverter } from '../../../../shared/domain/organisation/organisation-converter';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { OrganisationService } from '../../../../shared/services/organisation/organisation.service';
import { WindowService } from '../../../../shared/services/window/window.service';
import { PaletteModule } from '../palette.module';
import { PaletteUtilsModule } from '../utils';
import { WriteOrganisationFieldComponent } from './write-organisation-field.component';

const caseFieldType = createFieldType('organisationName', 'Text');
const caseField = createCaseField('organisationName', 'New Organisation', 'Add new organisation name', caseFieldType, 'MANDATORY');

caseField.value = {
    OrganisationID: 'Org1234',
    OrganisationName: 'Waffles Ltd'
};

const organisations = [{
  organisationIdentifier: 'O111111',
  name: 'Woodford solicitor',
  addressLine1: '12',
  addressLine2: 'Nithdale Role',
  addressLine3: '',
  townCity: 'Liverpool',
  county: 'Merseyside',
  country: 'UK',
  postCode: 'L15 5AX'
}, {
  organisationIdentifier: 'O222222',
  name: 'Broker solicitor',
  addressLine1: '33',
  addressLine2: 'The square',
  addressLine3: 'Apps street',
  townCity: 'Swindon',
  county: 'Wiltshire',
  country: 'UK',
  postCode: 'SN1 3EB'
}, {
  organisationIdentifier: 'O333333',
  name: 'The Ethical solicitor',
  addressLine1: 'Davidson House',
  addressLine2: '33',
  addressLine3: 'The square',
  townCity: 'Reading',
  county: 'Berkshire',
  country: 'UK',
  postCode: 'RG11EB'
}, {
  organisationIdentifier: 'O444444',
  name: 'The SN1 solicitor',
  addressLine1: 'Davidson House',
  addressLine2: '44',
  addressLine3: 'The square',
  townCity: 'Reading',
  county: 'Berkshire',
  country: 'UK',
  postCode: 'RG11EX'
}];

export default {
  title: 'shared/components/palette/organisation/WriteOrganisationFieldComponent',
  component: WriteOrganisationFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PaletteModule,
        PaletteUtilsModule,
        ReactiveFormsModule
      ],
      declarations: [
        StorybookComponent
      ],
      providers: [
        MockProvider(OrganisationService, { getActiveOrganisations: () => of(organisations) }),
        OrganisationConverter,
        WindowService
       ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<WriteOrganisationFieldComponent> = (args: WriteOrganisationFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField,
  parent: {
    formGroup: {
      organisationName: {
        OrganisationID: 'Org1234',
        OrganisationName: 'Waffles Ltd'
      }
    },
    controls: {},
    setControl: () => {}
  }
};
