import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CaseTab } from '../../../domain';
import { FieldsUtils } from '../../../services/fields';
import { AbstractFieldReadComponent } from '../base-field/abstract-field-read.component';
import { FlagDetail, Flags } from './domain';
import { CaseFlagStatus } from './enums';

@Component({
  selector: 'ccd-read-case-flag-field',
  templateUrl: './read-case-flag-field.component.html',
  styleUrls: ['./read-case-flag-field.component.scss']
})
export class ReadCaseFlagFieldComponent extends AbstractFieldReadComponent implements OnInit {

  public flagsData: Flags[];
  public partyLevelCaseFlagData: Flags[];
  public caseLevelCaseFlagData: Flags;

  constructor(
    private readonly route: ActivatedRoute
  ) {
    super();
  }

  public ngOnInit(): void {
    // Determine the tab this CaseField belongs to (should be only one), from the CaseView object in the snapshot data,
    // and extract all flags-related data from its Flags fields
    if (this.route.snapshot.data.case && this.route.snapshot.data.case.tabs) {
      this.flagsData = (this.route.snapshot.data.case.tabs as CaseTab[])
      .filter(tab => tab.fields && tab.fields
        .some(caseField => caseField.field_type.id === 'FlagLauncher' && caseField.field_type.type === 'FlagLauncher'))
      [0].fields.reduce((flags, caseField) => {
        if (FieldsUtils.isFlagsCaseField(caseField) && caseField.value) {
          flags.push(
            {
              partyName: caseField.value.partyName,
              roleOnCase: caseField.value.roleOnCase,
              details: caseField.value.details
                ? ((caseField.value.details) as any[]).map(detail => {
                  return Object.assign({}, ...Object.keys(detail.value).map(k => {
                    switch (k) {
                      // These two fields are date-time fields
                      case 'dateTimeModified':
                      case 'dateTimeCreated':
                        return {[k]: new Date(detail.value[k])};
                      // This field is a "yes/no" field
                      case 'hearingRelevant':
                        return detail.value[k].toUpperCase() === 'YES' ? {[k]: true} : {[k]: false};
                      default:
                        return {[k]: detail.value[k]};
                    }
                  }))
                }) as FlagDetail[]
                : null
            }
          );
        }
        return flags;
      }, []) as Flags[];
    }

    // TODO: Remove hard-coding
    // The development of this component is in-progress state
    // Added temporarily until case flags are available as part of case details
    console.log('CASE FIELD - CASE FLAG', this.caseField);

    this.generateCaseFlagData();
    // this.categoriseCaseFlagData();
  }

  public generateCaseFlagData(): void {
    // TODO: Remove hard-coding
    // The development of this component is in-progress state
    // Added temporarily until case flags are available as part of case details
    this.partyLevelCaseFlagData = [
      {
        partyName: 'John Smith',
        roleOnCase: '',
        details: []
        // details: [
        //   {
        //     name: 'Wheel chair access',
        //     subTypeValue: '',
        //     subTypeKey: '',
        //     otherDescription: '',
        //     flagComment: '',
        //     dateTimeModified: new Date('2021-08-19 00:00:00'),
        //     dateTimeCreated: new Date('2021-06-09 00:00:00'),
        //     path: [],
        //     hearingRelevant: false,
        //     flagCode: '',
        //     status: CaseFlagStatus.ACTIVE
        //   },
        //   {
        //     name: 'Sign language',
        //     subTypeValue: 'British Sign Language (BSL)',
        //     subTypeKey: '',
        //     otherDescription: '',
        //     flagComment: '',
        //     dateTimeModified: new Date('2021-11-10 00:00:00'),
        //     dateTimeCreated: new Date('2021-12-03 00:00:00'),
        //     path: [],
        //     hearingRelevant: false,
        //     flagCode: '',
        //     status: CaseFlagStatus.INACTIVE
        //   }
        // ]
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
            status: CaseFlagStatus.INACTIVE
          }
        ]
      }
    ];

    this.caseLevelCaseFlagData = {
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
          status: CaseFlagStatus.INACTIVE
        }
      ]
    };
  }

  // public categoriseCaseFlagData(): void {
  //   this.partyLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.PARTY_LEVEL);
  //   this.caseLevelCaseFlagData = this.caseFlagData.filter(x => x.type === CaseFlagType.CASE_LEVEL);
  // }
}
