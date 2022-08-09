import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { StorybookComponent } from 'storybook/storybook.component';
import { PaletteModule } from '..';
import { ReadEmailFieldComponent } from './read-email-field.component';

const caseFieldType = createFieldType('email', 'Email');
const caseField = createCaseField('emailAddress', 'Email Address', 'Enter your email address', caseFieldType, 'MANDATORY');
caseField.value = 'test@email.co.uk';

export default {
  title: 'shared/components/palette/email/ReadEmailFieldComponent',
  component: ReadEmailFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [PaletteModule],
      declarations: [StorybookComponent]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<ReadEmailFieldComponent> = (args: ReadEmailFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
