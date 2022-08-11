import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { MarkdownComponent } from '../markdown/markdown.component';
import { StorybookComponent } from 'storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { PaletteUtilsModule } from '../utils/utils.module';

import { MoneyGbpInputComponent } from './money-gbp-input.component';
import { WriteMoneyGbpFieldComponent } from './write-money-gbp-field.component';

const caseFieldType = createFieldType('money', 'MoneyGBP');
const caseField = createCaseField('id', 'Money', 'Enter some money', caseFieldType, 'MANDATORY');

export default {
  title: 'shared/components/palette/money-gbp/WriteMoneyGbpFieldComponent',
  component: WriteMoneyGbpFieldComponent,
  decorators: [
    moduleMetadata({
      declarations: [StorybookComponent, MoneyGbpInputComponent, MarkdownComponent],
      imports: [
        CommonModule,
        ReactiveFormsModule,
        PaletteUtilsModule
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
