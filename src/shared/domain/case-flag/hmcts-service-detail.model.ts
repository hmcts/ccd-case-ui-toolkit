/**
 * DTO to provide typing of the response from the Reference Data Location API for HMCTS service details.
 */
export class HmctsServiceDetail {
  business_area: string;
  ccd_case_types: string[];
  ccd_service_name: string;
  jurisdiction: string;
  last_update?: string;
  org_unit: string;
  service_code?: string;
  service_description?: string;
  service_id = 0;
  service_short_description?: string;
  sub_business_area: string;
}
