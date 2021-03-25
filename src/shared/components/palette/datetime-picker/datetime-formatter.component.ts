import { NgxMatDateFormats } from '@angular-material-components/datetime-picker';
import { AbstractFieldWriteComponent } from '../base-field';

export class DatetimeFormatter extends AbstractFieldWriteComponent {
  public CUSTOM_MOMENT_FORMATS: NgxMatDateFormats = {
    parse: {
      dateInput: (this.caseField && this.caseField.dateTimeEntryFormat) ? this.caseField.dateTimeEntryFormat : 'DD-MM-YYYY'
    },
    display: {
      dateInput: (this.caseField && this.caseField.dateTimeEntryFormat) ? this.caseField.dateTimeEntryFormat : 'MM-DD-YYYY',
      monthYearLabel: 'MMMM YYYY',
      dateA11yLabel: 'LLL',
      monthYearA11yLabel: 'MMMM YYYY',
    },
  };
}
