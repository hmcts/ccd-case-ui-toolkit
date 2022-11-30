import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField } from '../../../domain/definition';
import { PaletteContext } from '../base-field';
import { FlagDetail, FlagDetailDisplay, FlagsWithFormGroupPath } from './domain';
import { CaseFlagStatus, CaseFlagSummaryListDisplayMode } from './enums';
import { ReadCaseFlagFieldComponent } from './read-case-flag-field.component';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

import createSpyObj = jasmine.createSpyObj;
import createSpy = jasmine.createSpy;

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
      { id: null, value: 'Party' },
      { id: null, value: 'Reasonable adjustment' },
      { id: null, value: 'Mobility support' }
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
      { id: null, value: 'Party' },
      { id: null, value: 'Reasonable adjustment' },
      { id: null, value: 'Language support' }
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
      { id: null, value: 'Party' },
      { id: null, value: 'Security adjustment' }
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
      { id: null, value: 'Party' },
      { id: null, value: 'Reasonable adjustment' },
      { id: null, value: 'Language support' }
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
    path: [{ id: null, value: 'Party' }],
    hearingRelevant: 'Yes',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  }
  const witnessComplexFieldId = 'witness1';
  const witnessCaseFlagPartyName = 'Sawit All';
  const witnessCaseFlagRoleOnCase = 'Witness';
  const witnessComplexFieldFlagDetailsArray = [
    {
      id: '1e10472c-1a68-4665-b90a-3bcc6217403f',
      value: caseFlag1DetailsValue1
    }
  ];
  const witnessComplexFieldValue = {
    FirstName: 'Sawit',
    LastName: 'All',
    PartyFlags: {
      partyName: witnessCaseFlagPartyName,
      roleOnCase: witnessCaseFlagRoleOnCase,
      details: witnessComplexFieldFlagDetailsArray
    }
  };
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
                },
                {
                  id: witnessComplexFieldId,
                  field_type: {
                    id: 'Witness',
                    type: 'Complex',
                    complex_fields: [
                      {
                        id: 'FirstName',
                        field_type: {
                          id: 'Text',
                          type: 'Text'
                        }
                      } as CaseField,
                      {
                        id: 'LastName',
                        field_type: {
                          id: 'Text',
                          type: 'Text'
                        }
                      } as CaseField,
                      {
                        id: 'PartyFlags',
                        field_type: {
                          id: 'Flags',
                          type: 'Complex'
                        }
                      } as CaseField
                    ]
                  },
                  value: witnessComplexFieldValue
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
      [caseFlag1FieldId]: {
        controls: {
          partyName: null,
          roleOnCase: null
        },
        caseField: {
          id: caseFlag1FieldId,
          field_type: {
            id: 'Flags',
            type: 'Complex'
          }
        }
      },
      [caseFlag2FieldId]: {
        controls: {
          partyName: null,
          roleOnCase: null,
        },
        caseField: {
          id: caseFlag2FieldId,
          field_type: {
            id: 'Flags',
            type: 'Complex'
          },
          value: {
            partyName: caseFlag2PartyName,
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
      },
      [witnessComplexFieldId]: {
        controls: {
          FirstName: null,
          LastName: null,
        },
        caseField: {
          id: witnessComplexFieldId,
          field_type: {
            id: 'Witness',
            type: 'Complex'
          },
          value: {
            FirstName: 'Sawit',
            LastName: 'All',
            PartyFlags: {
              partyName: witnessCaseFlagPartyName,
              roleOnCase: witnessCaseFlagRoleOnCase,
              details: [
                ...witnessComplexFieldFlagDetailsArray,
                {
                  value: {
                    name: 'New flag in Witness field'
                  }
                }
              ]
            }
          }
        }
      },
      [flagLauncherCaseField.id]: {
        controls: {},
        caseField: flagLauncherCaseField,
        component: new WriteCaseFlagFieldComponent(null)
      }
    },
    get: (controlName: string) => {
      return formGroup.controls[controlName];
    }
  } as unknown as FormGroup;
  const selectedFlagsLocation = {
    flags: null,
    pathToFlagsFormGroup: caseFlag2FieldId,
    caseField: formGroup.controls[caseFlag2FieldId]['caseField']
  } as FlagsWithFormGroupPath;
  const selectedFlagsLocationInComplexField = {
    flags: null,
    pathToFlagsFormGroup: `${[witnessComplexFieldId]}.PartyFlags`,
    caseField: formGroup.controls[witnessComplexFieldId]['caseField']
  } as FlagsWithFormGroupPath;
  const createMode = '#ARGUMENT(CREATE)';
  const updateMode = '#ARGUMENT(UPDATE)';

  beforeEach(waitForAsync(() => {
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

  it('should set the first column header for case-level flags if the case title is available', () => {
    component.caseEditPageComponent.getCaseTitle = createSpy().and.returnValue('Dummy case title');
    component.ngOnInit();
    expect(component.caseEditPageComponent.getCaseTitle).toHaveBeenCalled();
    expect(component.caseLevelFirstColumnHeader).toEqual('Dummy case title');
  });

  it('should extract all flags-related data from the CaseView object in the snapshot data', () => {
    component.caseField = flagLauncherCaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(4);
    expect(component.flagsData[0].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].flags.details.length).toBe(2);
    expect(component.flagsData[0].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].flags.details[0].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[0].flags.details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].flags.details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].flags.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].flags.roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].flags.details.length).toBe(2);
    expect(component.flagsData[1].flags.details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].flags.details[1].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[1].flags.details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].flags.details[1].hearingRelevant).toBe(true);
    expect(component.flagsData[2].flags.flagsCaseFieldId).toEqual(caseFlagsFieldId);
    expect(component.flagsData[2].flags.partyName).toBeUndefined();
    expect(component.flagsData[2].flags.roleOnCase).toBeUndefined();
    expect(component.flagsData[2].flags.details.length).toBe(1);
    expect(component.flagsData[2].flags.details[0].name).toEqual(caseLevelFlagDetailsValue.name);
    expect(component.flagsData[2].flags.details[0].dateTimeModified).toEqual(new Date(caseLevelFlagDetailsValue.dateTimeModified));
    expect(component.flagsData[2].flags.details[0].dateTimeCreated).toEqual(new Date(caseLevelFlagDetailsValue.dateTimeCreated));
    expect(component.flagsData[2].flags.details[0].hearingRelevant).toBe(true);
    expect(component.flagsData[3].flags.flagsCaseFieldId).toEqual('PartyFlags');
    expect(component.flagsData[3].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[3].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    expect(component.flagsData[3].flags.details.length).toBe(1);
    expect(component.flagsData[3].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    // Check the party-level and case-level flags are separated correctly
    expect(component.partyLevelCaseFlagData.length).toBe(3);
    expect(component.partyLevelCaseFlagData[0].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.partyLevelCaseFlagData[1].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.partyLevelCaseFlagData[2].flags.flagsCaseFieldId).toEqual('PartyFlags');
    expect(component.caseLevelCaseFlagData).toEqual(component.flagsData[2]);
  });

  it('should not map a Flags case field to a Flags object when the case field value is falsy', () => {
    // Clear caseField.value for both party-level case flags
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value = null;
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value = undefined;
    component.ngOnInit();
    expect(component.flagsData.length).toBe(2);
  });

  it('should map a Flags case field to a Flags object even if it has no flag details', () => {
    // Clear caseField.value.details for both party-level case flags
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value.details = null;
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value.details = undefined;
    component.ngOnInit();
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].flags.details).toBeNull();
    expect(component.flagsData[1].flags.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].flags.roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].flags.details).toBeNull();
  });

  it('should select the correct (i.e. new) flag to display on the summary page, as part of the Create Case Flag journey', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncherCaseField.id]['component']['caseField'] = {
      display_context_parameter: createMode
    };
    formGroup.controls[flagLauncherCaseField.id]['component']['selectedFlagsLocation'] = selectedFlagsLocation;
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag'} as FlagDetail);
    // Check the correct display mode for the "Review flag details" summary page has been set
    expect(component.summaryListDisplayMode).toEqual(CaseFlagSummaryListDisplayMode.CREATE);
  });

  it('should select the correct (i.e. new) flag to display on the summary page, when the flag is contained in a Complex field', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncherCaseField.id]['component']['caseField'] = {
      display_context_parameter: createMode
    };
    formGroup.controls[flagLauncherCaseField.id]['component']['selectedFlagsLocation'] = selectedFlagsLocationInComplexField;
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag in Witness field'} as FlagDetail);
    // Check the correct display mode for the "Review flag details" summary page has been set
    expect(component.summaryListDisplayMode).toEqual(CaseFlagSummaryListDisplayMode.CREATE);
  });

  it('should show nothing on the summary page if the flag\'s CaseField object has no value', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncherCaseField.id]['component']['caseField'] = {
      display_context_parameter: createMode
    };
    selectedFlagsLocation.caseField.value = null;
    formGroup.controls[flagLauncherCaseField.id]['component']['selectedFlagsLocation'] = selectedFlagsLocation;
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeNull();
    // Check the correct display mode for the "Review flag details" summary page has been set
    expect(component.summaryListDisplayMode).toEqual(CaseFlagSummaryListDisplayMode.CREATE);
  });

  it('should select the correct (i.e. selected) flag to display on the summary page, as part of the Manage Case Flags journey', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncherCaseField.id]['component']['caseField'] = {
      display_context_parameter: updateMode
    };
    component.formGroup = formGroup;
    // Simulate presence of selected flag
    formGroup.controls[flagLauncherCaseField.id]['component'].selectedFlag = {
      flagDetailDisplay: {
        partyName: caseFlag2PartyName,
        flagDetail: caseFlag2DetailsValue1,
        flagsCaseFieldId: caseFlag2FieldId
      } as FlagDetailDisplay
    };
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual(caseFlag2DetailsValue1 as FlagDetail);
    expect(component.flagForSummaryDisplay.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    // Check the correct display mode for the "Review flag details" summary page has been set
    expect(component.summaryListDisplayMode).toEqual(CaseFlagSummaryListDisplayMode.MANAGE);
  });
});
