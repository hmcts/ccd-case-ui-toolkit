import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { PaletteUtilsModule } from '../utils/utils.module';
import { WritePhoneUKFieldComponent } from './write-phone-uk-field.component';

const caseFieldType = createFieldType('phoneUK', 'PhoneUK');
const caseField = createCaseField('phoneUK', 'Phone number', 'Add phone number eg. 08000000000', caseFieldType, 'MANDATORY');

caseField.value = '07777777777';

export default {
  title: 'shared/components/palette/phone-uk/WritePhoneUKFieldComponent',
  component: WritePhoneUKFieldComponent,
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

const template: Story<WritePhoneUKFieldComponent> = (args: WritePhoneUKFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
