import { Injectable } from '@angular/core';
import { LinkedCase } from '../domain';

@Injectable()
export class LinkedCasesService {

  public caseId: string;
  public linkedCases: LinkedCase[] = [];
  public preLinkedCases: LinkedCase[] = [];

  public casesToUnlink: LinkedCase[] = [
    {
      caseLink: {
        caseReference: '5283-8196-7254-2864',
        caseName: 'Jane Smith vs DWP',
        caseService: 'withDwp',
        caseState: '',
        caseType: 'Benefit_SCSS',
        createdDateTime: '10/01/2022',
        linkReason: [
          {
            reason: 'Progressed as part of this lead case'
          },
          {
            reason: 'Linked for a hearing'
          }
        ]
      }
    },
    {
      caseLink: {
        caseReference: '8254-9025-7233-6147',
        caseName: 'Johnny Smith',
        caseService: 'withDwp',
        caseState: '',
        caseType: 'Benefit_SCSS',
        createdDateTime: '11/05/2022',
        linkReason: [
          {
            reason: 'Case consolidated Familial Guardian Linked for a hearing'
          }
        ]
      }
    },
    {
      caseLink: {
        caseReference: '4652-7249-0269-6213',
        caseName: 'Dwayne Bravo',
        caseService: 'withDwp',
        caseState: '',
        caseType: 'Benefit_SCSS',
        createdDateTime: '12/03/2022',
        linkReason: [
          {
            reason: 'Familial'
          }
        ]
      }
    }
  ];
}
