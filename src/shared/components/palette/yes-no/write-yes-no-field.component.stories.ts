import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { StorybookComponent } from 'storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { MarkdownModule } from '../../markdown';
import { PaletteUtilsModule } from '../utils';
import { ReadYesNoFieldComponent } from './read-yes-no-field.component';
import { WriteYesNoFieldComponent } from './write-yes-no-field.component';
import { YesNoService } from './yes-no.service';

const caseFieldType = createFieldType('yesno', 'YesOrNo');
const caseField = createCaseField('id', 'Coming home?', 'Is it coming home?', caseFieldType, 'MANDATORY');
caseField.value = false;

export default {
  title: 'shared/components/palette/yes-no/WriteYesNoFieldComponent',
  component: WriteYesNoFieldComponent,
  decorators: [
    moduleMetadata({
        imports: [
            CommonModule,
            ReactiveFormsModule,
            PaletteUtilsModule,
            MarkdownModule
          ],
          declarations: [
            ReadYesNoFieldComponent,
            WriteYesNoFieldComponent,
            StorybookComponent
          ],
          providers: [
            YesNoService
          ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<WriteYesNoFieldComponent> = (args: WriteYesNoFieldComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField
};
