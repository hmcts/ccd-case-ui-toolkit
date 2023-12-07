import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { PaletteUtilsModule } from '../utils/utils.module';
import { ReadTextAreaFieldComponent } from './read-text-area-field.component';

const caseFieldType = createFieldType('textArea', 'TextArea');
const caseField = createCaseField('textArea', 'Write message', '', caseFieldType, 'MANDATORY');

caseField.value = 'Hello World';

export default {
  title: 'shared/components/palette/text-area/ReadTextAreaFieldComponent',
  component: ReadTextAreaFieldComponent,
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

const template: Story<ReadTextAreaFieldComponent> = (args: ReadTextAreaFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
