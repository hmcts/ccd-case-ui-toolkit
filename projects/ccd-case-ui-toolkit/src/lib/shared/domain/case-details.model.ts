// tslint:disable:variable-name
export class CaseDetails {
  public id: string;
  public jurisdiction: string;
  public case_type_id: string;
  public state: string;
  public created_date?: string;
  public last_modified?: string;
  public locked_by_user_id?: string;
  public security_level?: string;
  public case_data?: object;
}
