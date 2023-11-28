import { NgxMatDateFormats } from '@angular-material-components/datetime-picker';

export const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'DD-MM-YYYY HH:mm:ss'
  },
  display: {
    dateInput: 'DD-MM-YYYY HH:mm:ss',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'EEE/MMM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
