import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { MockProvider } from 'ng-mocks';
import { PaletteModule } from '..';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { OrganisationConverter } from '../../../../shared/domain/organisation/organisation-converter';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { OrganisationService } from '../../../../shared/services/organisation/organisation.service';
import { CaseReferencePipe } from '../../../pipes/case-reference/case-reference.pipe';
import { MarkdownComponent } from '../markdown/markdown.component';
import { PaletteService } from '../palette.service';
import { PaletteUtilsModule } from '../utils/utils.module';
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
        PaletteModule,
        PaletteUtilsModule,
        FormsModule,
        ReactiveFormsModule
      ],
      declarations: [
        StorybookComponent
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
