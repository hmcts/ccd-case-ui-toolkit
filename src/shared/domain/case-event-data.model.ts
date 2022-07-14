export class CaseEventData {
  public event: {
    id: string;
    summary: string;
    description: string;
  };
  public data?: object;
  public event_data?: object; // full event data
  public event_token: string;
  public ignore_warning: boolean;
  public draft_id?: string;
  public case_reference?: string;
}
