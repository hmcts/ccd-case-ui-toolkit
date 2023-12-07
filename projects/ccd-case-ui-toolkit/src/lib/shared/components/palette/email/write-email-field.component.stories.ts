import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { userEvent } from '@storybook/testing-library';
import { PaletteModule } from '..';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { WriteEmailFieldComponent } from './write-email-field.component';

const caseFieldType = createFieldType('email', 'Email');
const caseField = createCaseField('emailAddress', 'Email Address', 'Enter your email address', caseFieldType, 'MANDATORY');

export default {
  title: 'shared/components/palette/email/WriteEmailFieldComponent',
  component: WriteEmailFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [PaletteModule],
      declarations: [StorybookComponent]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<WriteEmailFieldComponent> = (args: WriteEmailFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};

standard.play = async () => {
  const emailInput = document.getElementsByTagName('input')[0];

  userEvent.clear(emailInput);
  await userEvent.type(emailInput, 'exampleemail@email.co.uk', {
    delay: 100,
  });
};
