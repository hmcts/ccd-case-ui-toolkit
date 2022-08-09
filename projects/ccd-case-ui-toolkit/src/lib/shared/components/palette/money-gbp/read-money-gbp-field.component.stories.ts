import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { StorybookComponent } from 'storybook/storybook.component';
import { PaletteModule } from '../palette.module';
import { MoneyGbpModule } from './money-gbp.module';
import { ReadMoneyGbpFieldComponent } from './read-money-gbp-field.component';

const caseFieldType = createFieldType('money', 'MoneyGBP');
const caseField = createCaseField('id', 'Money', 'Enter some money', caseFieldType, 'MANDATORY');
caseField.value = 100;

export default {
  title: 'shared/components/palette/money-gbp/ReadMoneyGbpFieldComponent',
  component: ReadMoneyGbpFieldComponent,
  decorators: [
    moduleMetadata({
      imports: [PaletteModule, MoneyGbpModule],
      declarations: [StorybookComponent]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<ReadMoneyGbpFieldComponent> = (args: ReadMoneyGbpFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
