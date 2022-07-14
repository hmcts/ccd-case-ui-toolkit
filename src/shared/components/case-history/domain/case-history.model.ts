import { Type } from 'class-transformer';
import { CaseTab, CaseViewEvent, Jurisdiction } from '../../../domain';

// @dynamic
export class CaseHistoryCaseType {
  public id: string;
  public name: string;
  public description?: string;

  @Type(() => Jurisdiction)
  public jurisdiction: Jurisdiction;
}

// @dynamic
export class CaseHistory {
  public case_id?: string;

  @Type(() => CaseHistoryCaseType)
  public caseType: CaseHistoryCaseType;

  @Type(() => CaseTab)
  public tabs: CaseTab[];

  @Type(() => CaseViewEvent)
  public event: CaseViewEvent;
}
