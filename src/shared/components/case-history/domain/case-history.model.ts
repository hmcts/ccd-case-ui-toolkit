import { Type } from 'class-transformer';
import { Jurisdiction, CaseTab, CaseViewEvent } from '../../../domain';

// @dynamic
export class CaseHistoryCaseType {
  id: string;
  name: string;
  description?: string;

  @Type(() => Jurisdiction)
  jurisdiction: Jurisdiction;
}

// @dynamic
export class CaseHistory {
  case_id?: string;

  @Type(() => CaseHistoryCaseType)
  caseType: CaseHistoryCaseType;

  @Type(() => CaseTab)
  tabs: CaseTab[];

  @Type(() => CaseViewEvent)
  event: CaseViewEvent;
}
