// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { Flags } from '../../components/palette/case-flag';
import { CaseField } from '../definition';
import { CaseTab } from './case-tab.model';
import { CaseViewEvent } from './case-view-event.model';
import { CaseViewTrigger } from './case-view-trigger.model';

// @dynamic
export class CaseView {
  public case_id?: string;
  public case_type: {
    id: string,
    name: string,
    description?: string,
    jurisdiction: {
      id: string,
      name: string,
      description?: string
    },
    printEnabled?: boolean
  };
  public state: {
    id: string,
    name: string,
    description?: string
    title_display?: string
  };
  public channels: string[];
  @Type(() => CaseTab)
  public tabs: CaseTab[];
  public triggers: CaseViewTrigger[];
  public events: CaseViewEvent[];
  @Type(() => CaseField)
  public metadataFields?: CaseField[];
  public basicFields?: {
    caseNameHmctsInternal?: string,
    caseManagementLocation?: {
      baseLocation?: number
    }
  };
  public case_flag?: Flags;
}

export interface ServiceOrg {
  business_are: string;
  ccd_case_types: string;
  ccd_service_name: string;
  jurisdiction: string;
  last_update?: string;
  org_unit: string;
  service_code: string;
  service_description: string;
  service_id: number;
  service_short_description: string;
  sub_business_area: string;

}
