import { CaseTab } from './case-tab.model';
import { CaseViewEvent } from './case-view-event.model';
import { CaseViewTrigger } from './case-view-trigger.model';
import { CaseField } from '../definition';
import { Type } from 'class-transformer';

// @dynamic
export class CaseView {
  case_id?: string;
  case_type: {
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
  state: {
    id: string,
    name: string,
    description?: string
    title_display?: string
  };
  channels: string[];
  @Type(() => CaseTab)
  tabs: CaseTab[];
  triggers: CaseViewTrigger[];
  events: CaseViewEvent[];
  @Type(() => CaseField)
  metadataFields?: CaseField[];
  basicFields?: {
    caseNameHmctsInternal?: string,
    caseManagementLocation?: {
      baseLocation?: number
    }
  };
  access?: {
    grantType: string,
    beginTime: Date,
    endTime: Date,
    created: Date
  };
}
