import { MatDateFormats } from '@angular/material/core';

export const CUSTOM_MOMENT_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'DD-MM-YYYY HH:mm:ss'
  },
  display: {
    dateInput: 'DD-MM-YYYY HH:mm:ss',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'EEE/MMM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
