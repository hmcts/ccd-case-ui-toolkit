export class CaseEventData {
  event: {
    id: string;
    summary: string;
    description: string;
  };
  data?: object;
  event_data?: object; // full event data
  event_token: string;
  ignore_warning: boolean;
  draft_id?: string;
  case_reference?: string;
}
