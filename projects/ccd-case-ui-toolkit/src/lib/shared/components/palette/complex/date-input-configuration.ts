export interface DateInputPartConfiguration {
  fieldId: string;
  label: string;
  cssClass: string;
  maxLength: number;
}

export interface DateInputConfiguration {
  day: DateInputPartConfiguration;
  month: DateInputPartConfiguration;
  year: DateInputPartConfiguration;
}

export const DATE_INPUT_REQUIRED = 'dateInputRequired';
export const DATE_INPUT_INVALID = 'dateInputInvalid';

export const TIMELINE_OF_EVENTS_DATE_INPUT: DateInputConfiguration = {
  day: {
    fieldId: 'timelineDay',
    label: 'Day',
    cssClass: 'form-group-day',
    maxLength: 2
  },
  month: {
    fieldId: 'timelineMonth',
    label: 'Month',
    cssClass: 'form-group-month',
    maxLength: 2
  },
  year: {
    fieldId: 'timelineYear',
    label: 'Year',
    cssClass: 'form-group-year',
    maxLength: 4
  }
};
