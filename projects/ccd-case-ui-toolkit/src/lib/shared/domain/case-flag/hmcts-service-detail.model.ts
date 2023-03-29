/**
 * DTO to provide typing of the response from the Reference Data Location API for HMCTS service details.
 */
export class HmctsServiceDetail {
  public business_area: string;
  public ccd_case_types: string[];
  public ccd_service_name: string;
  public jurisdiction: string;
  public last_update?: string;
  public org_unit: string;
  public service_code?: string;
  public service_description?: string;
  public service_id = 0;
  public service_short_description?: string;
  public sub_business_area: string;
}
