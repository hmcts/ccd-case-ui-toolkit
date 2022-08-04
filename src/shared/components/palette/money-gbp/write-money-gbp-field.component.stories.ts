import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { CaseFieldService } from 'src/shared/services';
import { StorybookComponent } from 'storybook/storybook.component';
import { MarkdownModule } from '../../markdown';
import { PaletteUtilsModule } from '../utils';
import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';

const caseFieldType = createFieldType('money', 'MoneyGBP');
const caseField = createCaseField('id', 'Money', 'Enter some money', caseFieldType, 'MANDATORY');

export default {
  title: 'shared/components/palette/money-gbp/WriteMoneyGbpFieldComponent',
  component: WriteMoneyGbpFieldComponent,
  decorators: [
    moduleMetadata({
      declarations: [StorybookComponent, MoneyGbpInputComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        PaletteUtilsModule,
        MarkdownModule
      ],
      providers: [
        CaseFieldService
      ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<WriteMoneyGbpFieldComponent> = (args: WriteMoneyGbpFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
