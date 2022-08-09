import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { StorybookComponent } from 'storybook/storybook.component';
import { WriteTextAreaFieldComponent } from './write-text-area-field.component';
import { ReactiveFormsModule } from '@angular/forms';
import { PaletteUtilsModule } from '../utils/utils.module';

const caseFieldType = createFieldType('textArea', 'TextArea');
const caseField = createCaseField('textArea', 'Write message', 'Write your message', caseFieldType, 'MANDATORY');

caseField.value = 'Hello World';

export default {
  title: 'shared/components/palette/text-area/WriteTextAreaFieldComponent',
  component: WriteTextAreaFieldComponent,
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

const template: Story<WriteTextAreaFieldComponent> = (args: WriteTextAreaFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
