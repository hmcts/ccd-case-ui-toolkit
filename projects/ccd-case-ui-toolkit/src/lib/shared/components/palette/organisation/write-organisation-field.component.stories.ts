import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { StorybookComponent } from 'storybook/storybook.component';
import { OrganisationConverter } from '../../../../shared/domain/organisation/organisation-converter';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { OrganisationService } from '../../../../shared/services/organisation/organisation.service';
import { WindowService } from '../../../../shared/services/window/window.service';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteUtilsModule } from '../utils';
import { WriteOrganisationComplexFieldComponent } from './write-organisation-complex-field.component';
import { WriteOrganisationFieldComponent } from './write-organisation-field.component';

const caseFieldType = createFieldType('organisationName', 'Text');
const caseField = createCaseField('organisationName', 'New Organisation', 'Add new organisation name', caseFieldType, 'MANDATORY');

caseField.value = {
    OrganisationID: 'Org1234',
    OrganisationName: 'Waffles Ltd'
};

export default {
  title: 'shared/components/palette/organisation/WriteOrganisationFieldComponent',
  component: WriteOrganisationFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PaletteUtilsModule,
        ReactiveFormsModule,
        MarkdownModule
      ],
      declarations: [
        WriteOrganisationComplexFieldComponent, StorybookComponent
      ],
      providers: [
        MockProvider(OrganisationService),
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
