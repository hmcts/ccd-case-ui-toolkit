import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField } from '../../../domain/definition';
import { PaletteContext } from '../base-field';
import { FlagDetail } from './domain';
import { CaseFlagStatus } from './enums';
import { ReadCaseFlagFieldComponent } from './read-case-flag-field.component';

import createSpyObj = jasmine.createSpyObj;

describe('ReadCaseFlagFieldComponent', () => {
  let component: ReadCaseFlagFieldComponent;
  let fixture: ComponentFixture<ReadCaseFlagFieldComponent>;
  const flaglauncher_id = 'FlagLauncher';
  const flagLauncherCaseField: CaseField = {
    id: 'FlagLauncher1',
    field_type: {
      id: flaglauncher_id,
      type: flaglauncher_id
    }
  } as CaseField;
  const caseFlag1FieldId = 'CaseFlag1';
  const caseFlag1PartyName = 'John Smith';
  const caseFlag1RoleOnCase = 'Claimant';
  const caseFlag1DetailsValue1 = {
    name: 'Wheelchair access',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Mobility support'
    ],
    hearingRelevant: 'No',
    flagCode: 'WCA',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag1DetailsValue2 = {
    name: 'Sign language',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Language support'
    ],
    hearingRelevant: 'No',
    flagCode: 'BSL',
    status: CaseFlagStatus.INACTIVE
  };
  const caseFlag2FieldId = 'CaseFlag2';
  const caseFlag2PartyName = 'Ann Peterson';
  const caseFlag2RoleOnCase = 'Defendant';
  const caseFlag2DetailsValue1 = {
    name: 'Foreign national offender',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Security adjustment'
    ],
    hearingRelevant: 'Yes',
    flagCode: 'FNO',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag2DetailsValue2 = {
    name: 'Sign language',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      'Party',
      'Reasonable adjustment',
      'Language support'
    ],
    hearingRelevant: 'Yes',
    flagCode: 'WCA',
    status: CaseFlagStatus.INACTIVE
  };
  const caseFlagsFieldId = 'caseFlags';
  const caseLevelFlagDetailsValue = {
    name: 'Other',
    dateTimeModified: '2022-06-14T01:00:00.000',
    dateTimeCreated: '2022-06-14T00:00:00.000',
    path: [ 'Party' ],
    hearingRelevant: 'Yes',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  }
  const mockRoute = {
    snapshot: {
      data: {
        case: {
          tabs: [
            {
              id: 'Data',
              fields: []
            },
            {
              id: 'History',
              fields: []
            },
            {
              id: 'Case flags',
              fields: [
                flagLauncherCaseField,
                {
                  id: caseFlag1FieldId,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlag1PartyName,
                    roleOnCase: caseFlag1RoleOnCase,
                    details: [
                      {
                        id: '6e8784ca-d679-4f36-a986-edc6ad255dfa',
                        value: caseFlag1DetailsValue1
                      },
                      {
                        id: '9a179b7c-50a8-479f-a99b-b191ec8ec192',
                        value: caseFlag1DetailsValue2
                      }
                    ]
                  }
                },
                {
                  id: caseFlag2FieldId,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlag2PartyName,
                    roleOnCase: caseFlag2RoleOnCase,
                    details: [
                      {
                        id: '61160453-647b-4065-a786-9443556055f1',
                        value: caseFlag2DetailsValue1
                      },
                      {
                        id: '0629f5cd-52bc-41ac-a2e0-5da9bbee2068',
                        value: caseFlag2DetailsValue2
                      }
                    ]
                  }
                },
                {
                  id: caseFlagsFieldId,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    details: [
                      {
                        id: 'ab4cab59-dec2-4869-8a9c-afa27a6e9be8',
                        value: caseLevelFlagDetailsValue
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };
  const formGroup = {
    controls: {
      caseFlag1: {
        controls: {
          partyName: null,
          roleOnCase: null
        }
      },
      caseFlag2: {
        controls: {
          partyName: null,
          roleOnCase: null,
          flagType: null
        },
        caseField: {
          value: {
            partyName: 'Party 2',
            details: [
              {
                id: '0000',
                value: {
                  name: 'Existing flag'
                }
              },
              {
                value: {
                  name: 'New flag'
                }
              }
            ]
          }
        }
      }
    }
  } as unknown as FormGroup;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ReadCaseFlagFieldComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadCaseFlagFieldComponent);
    component = fixture.componentInstance;
    component.caseEditPageComponent = createSpyObj('caseEditPageComponent', ['getCaseTitle']);
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract all flags-related data from the CaseView object in the snapshot data', () => {
    component.caseField = flagLauncherCaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(3);
    expect(component.flagsData[0].flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].details.length).toBe(2);
    expect(component.flagsData[0].details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].details[0].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[0].details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].details.length).toBe(2);
    expect(component.flagsData[1].details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].details[1].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[1].details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].details[1].hearingRelevant).toBe(true);
    expect(component.flagsData[2].flagsCaseFieldId).toEqual(caseFlagsFieldId);
    expect(component.flagsData[2].partyName).toBeUndefined();
    expect(component.flagsData[2].roleOnCase).toBeUndefined();
    expect(component.flagsData[2].details.length).toBe(1);
    expect(component.flagsData[2].details[0].name).toEqual(caseLevelFlagDetailsValue.name);
    expect(component.flagsData[2].details[0].dateTimeModified).toEqual(new Date(caseLevelFlagDetailsValue.dateTimeModified));
    expect(component.flagsData[2].details[0].dateTimeCreated).toEqual(new Date(caseLevelFlagDetailsValue.dateTimeCreated));
    expect(component.flagsData[2].details[0].hearingRelevant).toBe(true);
    expect(component.caseEditPageComponent.getCaseTitle).toHaveBeenCalled();
  });

  it('should not map a Flags case field to a Flags object when the case field value is falsy', () => {
    // Clear caseField.value for both party-level case flags
    TestBed.get(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value = null;
    TestBed.get(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value = undefined;
    component.ngOnInit();
    expect(component.flagsData.length).toBe(1);
  });

  it('should map a Flags case field to a Flags object even if it has no flag details', () => {
    // Clear caseField.value.details for both party-level case flags
    TestBed.get(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value.details = null;
    TestBed.get(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value.details = undefined;
    component.ngOnInit();
    expect(component.flagsData[0].partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].details).toBeNull();
    expect(component.flagsData[1].partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].details).toBeNull();
  });

  it('should select the correct (i.e. new) flag to display on the summary page', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual('Party 2');
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag'} as FlagDetail);
  });
});
