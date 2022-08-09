import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { StorybookComponent } from 'storybook/storybook.component';
import { OrganisationConverter } from '../../../../shared/domain/organisation/organisation-converter';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { OrganisationService } from '../../../../shared/services/organisation/organisation.service';
import { MarkdownModule } from '../../markdown/markdown.module';
import { PaletteService } from '../palette.service';
import { PaletteUtilsModule } from '../utils';
import { ReadOrganisationFieldRawComponent } from './read-organisation-field-raw.component';
import { ReadOrganisationFieldTableComponent } from './read-organisation-field-table.component';
import { ReadOrganisationFieldComponent } from './read-organisation-field.component';

const caseFieldType = createFieldType('organisationName', 'Text');
const caseField = createCaseField('organisationName', 'New Organisation', 'Add new organisation name', caseFieldType, 'MANDATORY');

caseField.value = {
    OrganisationID: 'Org1234',
    OrganisationName: 'Waffles Ltd'
};
caseField.display_context_parameter = 'test';

export default {
  title: 'shared/components/palette/organisation/ReadOrganisationFieldComponent',
  component: ReadOrganisationFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        PaletteUtilsModule,
        FormsModule,
        ReactiveFormsModule,
        MarkdownModule
      ],
      declarations: [
        ReadOrganisationFieldRawComponent, ReadOrganisationFieldTableComponent, StorybookComponent
      ],
      providers: [
        MockProvider(OrganisationService),
        OrganisationConverter,
        PaletteService
       ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<ReadOrganisationFieldComponent> = (args: ReadOrganisationFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
