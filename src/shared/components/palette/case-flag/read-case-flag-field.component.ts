import { Component, OnInit } from '@angular/core';
import { Flag } from './domain';
import { CaseFlagStatus } from './enums';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html'
})
export class ReadCaseFlagFieldComponent implements OnInit {

  public caseFlagData: Flag[];
  public partyLevelCaseFlagData: Flag[];
  public caseLevelCaseFlagData: Flag[];

  constructor() {
  }

  public ngOnInit(): void {
    this.generateCaseFlagData();
    // this.categoriseCaseFlagData();
  }

  public generateCaseFlagData(): void {
    this.partyLevelCaseFlagData = [
      {
        partyName: 'John Smith',
        roleOnCase: '',
        details: [
          {
            name: 'Wheel chair access',
            subTypeValue: '',
            subTypeKey: '',
            otherDescription: '',
            flagComment: '',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          },
          {
            name: 'Sign language',
            subTypeValue: 'British Sign Language (BSL)',
            subTypeKey: '',
            otherDescription: '',
            flagComment: '',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          }
        ]
      },
      {
        partyName: 'Ann Peterson',
        roleOnCase: '',
        details: [
          {
            name: 'Foreign national offender',
            subTypeValue: '',
            subTypeKey: '',
            otherDescription: '',
            flagComment: 'Flight risk',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          },
          {
            name: 'Sign language',
            subTypeValue: 'British Sign Language (BSL)',
            subTypeKey: '',
            otherDescription: '',
            flagComment: '',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          }
        ]
      }
    ];

    this.caseLevelCaseFlagData = [
      {
        partyName: 'Smith v Peterson',
        roleOnCase: '',
        details: [
          {
            name: 'Potentially violent person fraud',
            subTypeValue: '',
            subTypeKey: '',
            otherDescription: '',
            flagComment: 'Verbally abusive behaviour demonstrated at previous hearing additional security will be required',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          },
          {
            name: 'Complex case',
            subTypeValue: '',
            subTypeKey: '',
            otherDescription: '',
            flagComment: 'Requires senior case worker',
            dateTimeModified: new Date('2021-09-09 00:00:00'),
            dateTimeCreated: new Date('2021-09-09 00:00:00'),
            path: [],
            hearingRelevant: false,
            flagCode: '',
            status: CaseFlagStatus.ACTIVE
          }
        ]
      }
    ];
  }

  // public categoriseCaseFlagData(): void {
  //   this.partyLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.PARTY_LEVEL);
  //   this.caseLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.CASE_LEVEL);
  // }
}
