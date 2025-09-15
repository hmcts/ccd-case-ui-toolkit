import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { StorybookComponent } from '../../../../../../../../storybook/storybook.component';
import { createCaseField, createFieldType } from '../../../../shared/fixture/shared.test.fixture';
import { FormatTranslatorService } from '../../../../shared/services/case-fields/format-translator.service';
import { CaseFieldService } from '../../../services/case-fields/case-field.service';
import { PaletteModule } from '../palette.module';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';
import { DatetimePickerComponent } from './datetime-picker.component';

const caseFieldType = createFieldType('date', 'Date');
const caseField = createCaseField('id', 'Date', 'Enter your date of birth', caseFieldType, 'MANDATORY');
const caseFieldService = new CaseFieldService();

const Meta: Meta<DatetimePickerComponent> = {
  title: 'shared/components/palette/datetime-picker/DatetimePickerComponent',
  component: DatetimePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [PaletteModule, BrowserAnimationsModule],
      declarations: [StorybookComponent],
      providers: [
        FormatTranslatorService,
        { provide: MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
        { provide: MAT_DATE_LOCALE, useValue: 'en-GB' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
        { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
        { provide: CaseFieldService, useValue: caseFieldService }
      ]
    }),
    componentWrapperDecorator((story) => `<storybook-wrapper>${story}</storybook-wrapper>`)
  ],
  tags: ['autodocs']
};

export default Meta;

type Story = StoryObj<DatetimePickerComponent>;
//
// const template: Story<DatetimePickerComponent> = (args: DatetimePickerComponent) => ({
//   props: args,
// });

export const standard: Story = {
  args: {
    caseField,
    dateControl: new FormControl(new Date()),
  },
  // If you prefer the old “template” pattern, keep it here:
  render: (args: DatetimePickerComponent) => ({ props: args }),
};
