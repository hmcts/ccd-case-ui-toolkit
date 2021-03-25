import { NgxMatDateFormats } from '@angular-material-components/datetime-picker';

export const CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
  parse: {
    dateInput: 'DD/MM/YYYY HH:mm:SS'
  },
  display: {
    dateInput: 'DD/MM/YYYY HH:mm:SS',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LLL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
