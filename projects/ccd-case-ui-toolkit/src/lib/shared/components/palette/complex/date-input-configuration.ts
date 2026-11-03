import { CaseField } from '../../../domain/definition/case-field.model';

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
export const TIMELINE_OF_EVENTS_DATE_LABEL_FIELD_ID = 'timelineDateLabel';

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

export function isTimelineOfEventsDateInputConfigured(caseField: CaseField): boolean {
  const complexFields = caseField?.field_type?.complex_fields;
  if (!complexFields?.length) {
    return false;
  }

  const displayContext = (fieldId: string): string | undefined =>
    complexFields.find((field) => field?.id === fieldId)?.display_context?.toUpperCase();

  return displayContext(TIMELINE_OF_EVENTS_DATE_LABEL_FIELD_ID) === 'READONLY'
    && displayContext(TIMELINE_OF_EVENTS_DATE_INPUT.day.fieldId) === 'OPTIONAL'
    && displayContext(TIMELINE_OF_EVENTS_DATE_INPUT.month.fieldId) === 'MANDATORY'
    && displayContext(TIMELINE_OF_EVENTS_DATE_INPUT.year.fieldId) === 'MANDATORY';
}
