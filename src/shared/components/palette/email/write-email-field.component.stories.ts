// also exported from '@storybook/angular' if you can deal with breaking changes in 6.1
import { FormControl } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { StorybookComponent } from 'storybook/storybook.component';
import { PaletteModule } from '..';
import { WriteEmailFieldComponent } from './write-email-field.component';

const emailField = createFieldType('test', 'Email');

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

// More on component templates: https://storybook.js.org/docs/angular/writing-stories/introduction#using-args
const Template: Story<WriteEmailFieldComponent> = (args: WriteEmailFieldComponent) => ({
  props: args,
});

export const Default = Template.bind({});
// More on args: https://storybook.js.org/docs/angular/writing-stories/args
Default.args = {
  caseField: createCaseField('debtorName', 'Debtor name', '', emailField, 'MANDATORY'),
  emailControl: new FormControl()
};
