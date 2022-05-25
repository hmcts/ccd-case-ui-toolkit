import { Injectable } from '@angular/core';
import { CaseLink } from '../domain';

@Injectable()
export class LinkedCasesService {
  public caseId: string;
  public linkedCases: CaseLink[] = [];
  public preLinkedCases: CaseLink[] = [];
}
