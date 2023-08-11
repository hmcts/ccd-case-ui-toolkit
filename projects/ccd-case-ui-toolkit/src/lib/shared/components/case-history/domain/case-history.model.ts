// tslint:disable:variable-name
import { Type } from 'class-transformer';
import { CaseTab } from '../../../domain/case-view/case-tab.model';
import { CaseViewEvent } from '../../../domain/case-view/case-view-event.model';
import { Jurisdiction } from '../../../domain/definition/jurisdiction.model';

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
