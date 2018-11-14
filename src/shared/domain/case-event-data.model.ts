export class CaseEventData {
  event: {
    id: string;
    summary: string;
    description: string;
  };
  data?: object;
  event_token: string;
  ignore_warning: boolean;
  draft_id?: string;
}
