import { Injectable } from '@angular/core';
import { LinkedCase } from '../domain';

@Injectable()
export class LinkedCasesService {

  public linkedCases: LinkedCase[] = [];
  public preLinkedCases: LinkedCase[] = [];
  public casesToUnlink: LinkedCase[] = [];
}
