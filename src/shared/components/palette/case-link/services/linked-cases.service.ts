import { Injectable } from '@angular/core';
import { LovRefDataModel } from '../../../../services/common-data-service/common-data-service';
import { CaseLink } from '../domain';

@Injectable()
export class LinkedCasesService {
  public caseId: string;
  public linkCaseReasons: LovRefDataModel[] = [];
  public linkedCases: CaseLink[] = [];
  public preLinkedCases: CaseLink[] = [];
}
