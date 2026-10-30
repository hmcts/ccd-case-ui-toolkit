export interface DateInputConfiguration {
  dayFieldId: string;
  monthFieldId: string;
  yearFieldId: string;
}

export const DATE_INPUT_REQUIRED = 'dateInputRequired';
export const DATE_INPUT_INVALID = 'dateInputInvalid';

export const TIMELINE_OF_EVENTS_DATE_INPUT: DateInputConfiguration = {
  dayFieldId: 'timelineDay',
  monthFieldId: 'timelineMonth',
  yearFieldId: 'timelineYear'
};
