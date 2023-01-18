export class CaseViewEvent {
  public id: number;
  public timestamp: string;
  public summary: string;
  public comment: string;
  public event_id: string;
  public event_name: string;
  public state_id: string;
  public state_name: string;
  public user_id: number;
  public user_last_name: string;
  public user_first_name: string;
  public significant_item: {
    type: string,
    description: string,
    url: string
  };
}
