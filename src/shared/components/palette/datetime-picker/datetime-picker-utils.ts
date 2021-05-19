import { NgxMatDateFormats } from '@angular-material-components/datetime-picker';

export const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'YYYY MM DD HH:mm:ss'
  },
  display: {
    dateInput: 'YYYY MM DD HH:mm:ss',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'EEE/MMM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
