import { NGX_MAT_DATE_FORMATS, NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { NgxMatMomentAdapter } from '@angular-material-components/moment-adapter';
import { FormControl } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { componentWrapperDecorator, Meta, moduleMetadata, Story } from '@storybook/angular';
import { createCaseField, createFieldType } from 'src/shared/fixture/shared.test.fixture';
import { CaseFieldService } from 'src/shared/services';
import { FormatTranslatorService } from 'src/shared/services/case-fields/format-translator.service';
import { StorybookComponent } from 'storybook/storybook.component';
import { PaletteModule } from '..';
import { CUSTOM_MOMENT_FORMATS } from './datetime-picker-utils';
import { DatetimePickerComponent } from './datetime-picker.component';

const caseFieldType = createFieldType('date', 'Date');
const caseField = createCaseField('id', 'Date', 'Enter your date of birth', caseFieldType, 'MANDATORY');
const caseFieldService = new CaseFieldService();

export default {
  title: 'shared/components/palette/datetime-picker/DatetimePickerComponent',
  component: DatetimePickerComponent,
  decorators: [
    moduleMetadata({
      imports: [PaletteModule, BrowserAnimationsModule],
      declarations: [StorybookComponent],
      providers: [FormatTranslatorService,
        { provide: NGX_MAT_DATE_FORMATS, useValue: CUSTOM_MOMENT_FORMATS },
        { provide: NgxMatDateAdapter, useClass: NgxMatMomentAdapter },
        { provide: CaseFieldService, useValue: caseFieldService }
        ]
    }),
    componentWrapperDecorator(story => `<storybook-wrapper>${story}</storybook-wrapper>`),
  ]
} as Meta;

const template: Story<DatetimePickerComponent> = (args: DatetimePickerComponent) => ({
  props: args,
});

export const standard: Story = template.bind({});

standard.args = {
  caseField,
  dateControl: new FormControl(new Date())
};
