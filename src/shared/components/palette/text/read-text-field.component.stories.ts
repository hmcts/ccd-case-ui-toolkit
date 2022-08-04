import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { StorybookComponent } from 'storybook/storybook.component';
import { ReadTextFieldComponent } from './read-text-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';

const caseFieldType = createFieldType('text', 'Text');
const caseField = createCaseField('text', 'Hello World', '', caseFieldType, 'MANDATORY');
caseField.value = 'Hello World';

export default {
  title: 'shared/components/palette/text/ReadTextFieldComponent',
  component: ReadTextFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [
        ReactiveFormsModule,
        PaletteUtilsModule
      ],
      declarations: [StorybookComponent]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<ReadTextFieldComponent> = (args: ReadTextFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
