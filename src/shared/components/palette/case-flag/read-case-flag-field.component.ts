import { Component, OnInit } from '@angular/core';
import { CaseFlag } from './domain';
import { CaseFlagStatus } from './enums';
import { CaseFlagType } from './enums/case-flag-type.enum';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html'
})
export class ReadCaseFlagFieldComponent implements OnInit {

  public caseFlagData: CaseFlag[];
  public partyLevelCaseFlagData: CaseFlag[];
  public caseLevelCaseFlagData: CaseFlag[];

  constructor() {
  }

  public ngOnInit(): void {
    this.generateCaseFlagData();
    this.categoriseCaseFlagData();
  }

  public generateCaseFlagData(): void {
    this.caseFlagData = [
      {
        flagName: 'Wheel chair access',
        type: CaseFlagType.PARTY_LEVEL,
        description: '',
        comments: '',
        creationDate: new Date('2021-09-09 00:00:00'),
        lastModified: new Date('2021-09-09 00:00:00'),
        status: CaseFlagStatus.ACTIVE
      },
      {
        flagName: 'Sign Language',
        type: CaseFlagType.PARTY_LEVEL,
        description: 'British Sign Language (BSL)',
        comments: '',
        creationDate: new Date('2021-09-06 00:00:00'),
        lastModified: new Date('2021-09-06 00:00:00'),
        status: CaseFlagStatus.ACTIVE
      },
      {
        flagName: 'Foreign national offender',
        type: CaseFlagType.PARTY_LEVEL,
        description: '',
        comments: 'Flight risk',
        creationDate: new Date('2021-09-07 00:00:00'),
        lastModified: new Date('2021-09-07 00:00:00'),
        status: CaseFlagStatus.INACTIVE
      },
      {
        flagName: 'Potentially violent person fraud',
        type: CaseFlagType.CASE_LEVEL,
        description: '',
        comments: 'Verbally abusive behaviour demonstrated at previous hearing additional security will be required',
        creationDate: new Date('2021-09-09 00:00:00'),
        lastModified: new Date('2021-09-09 00:00:00'),
        status: CaseFlagStatus.ACTIVE
      },
      {
        flagName: 'Complex case',
        type: CaseFlagType.CASE_LEVEL,
        description: '',
        comments: 'Requires senior case worker',
        creationDate: new Date('2021-09-08 00:00:00'),
        lastModified: new Date('2021-09-08 00:00:00'),
        status: CaseFlagStatus.ACTIVE
      }
    ];
  }

  public categoriseCaseFlagData(): void {
    this.partyLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.PARTY_LEVEL);
    this.caseLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.CASE_LEVEL);
  }
}
