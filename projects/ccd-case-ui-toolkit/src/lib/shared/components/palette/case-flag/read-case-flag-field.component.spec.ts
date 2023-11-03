import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CaseEditDataService } from '../../../commons/case-edit-data/case-edit-data.service';
import { CaseField } from '../../../domain/definition';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { PaletteContext } from '../base-field';
import { FlagDetail, FlagDetailDisplay, FlagsWithFormGroupPath } from './domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagStatus } from './enums';
import { ReadCaseFlagFieldComponent } from './read-case-flag-field.component';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

describe('ReadCaseFlagFieldComponent', () => {
  let component: ReadCaseFlagFieldComponent;
  let fixture: ComponentFixture<ReadCaseFlagFieldComponent>;
  let router: Router;
  let route: ActivatedRoute;

  const flaglauncherId = 'FlagLauncher';
  const flagLauncher1CaseField: CaseField = {
    id: 'FlagLauncher1',
    field_type: {
      id: flaglauncherId,
      type: flaglauncherId
    }
  } as CaseField;
  const flagLauncher2CaseField: CaseField = {
    id: 'FlagLauncher2',
    field_type: {
      id: flaglauncherId,
      type: flaglauncherId
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
    name: 'Language interpreter',
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
  };
  const witnessCaseFlagGroupId = '10f8dc79-363e-4c43-8391-80157b4c6bcb';
  const witnessCaseFlagGroupInternalFieldId = 'PartyFlagsInternal';
  const witnessCaseFlagGroupExternalFieldId = 'PartyFlagsExternal';
  const witnessComplexFieldId = 'witness1';
  const witnessCaseFlagPartyName = 'Sawit All';
  const witnessCaseFlagRoleOnCase = 'Witness';
  const witnessComplexFieldInternalFlagDetailsArray = [
    {
      id: '1e10472c-1a68-4665-b90a-3bcc6217403f',
      value: caseFlag1DetailsValue1
    }
  ];
  const witnessComplexFieldExternalFlagDetailsArray = [
    {
      id: '1c747e0f-9ea3-4c0a-bacf-24b542cefb02',
      value: caseFlag1DetailsValue2
    }
  ];
  const witnessComplexFieldValue = {
    FirstName: 'Sawit',
    LastName: 'All',
    PartyFlagsInternal: {
      partyName: witnessCaseFlagPartyName,
      roleOnCase: witnessCaseFlagRoleOnCase,
      details: witnessComplexFieldInternalFlagDetailsArray,
      groupId: witnessCaseFlagGroupId
    },
    PartyFlagsExternal: {
      partyName: witnessCaseFlagPartyName,
      roleOnCase: witnessCaseFlagRoleOnCase,
      details: witnessComplexFieldExternalFlagDetailsArray,
      groupId: witnessCaseFlagGroupId
    }
  };
  const caseFlag3FieldId = 'CaseFlag3';
  const caseFlag3PartyName = 'Jack Daniels';
  const caseFlag3RoleOnCase = 'Applicant';
  const caseFlag3DetailsValue1 = {
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
  const caseFlagGroup1Id = '00001111';
  const caseFlagGroup1FieldId1 = 'GroupedCaseFlag1a';
  const caseFlagGroup1PartyName = 'Maggie Strait';
  const caseFlagGroup1RoleOnCase = 'Appellant';
  const caseFlagGroup1DetailsValue1 = {
    name: 'Other - Group 1 Flag 1',
    dateTimeModified: '2023-09-19T01:00:00.000',
    dateTimeCreated: '2023-09-19T00:00:00.000',
    path: [{ id: null, value: 'Party' }],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlagGroup1FieldId2 = 'GroupedCaseFlag1b';
  const caseFlagGroup1DetailsValue2 = {
    name: 'Other - Group 1 Flag 2',
    dateTimeModified: '2023-09-19T01:00:00.000',
    dateTimeCreated: '2023-09-19T00:00:00.000',
    path: [{ id: null, value: 'Party' }],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlagGroup2Id = '00002222';
  const caseFlagGroup2FieldId1 = 'GroupedCaseFlag2a';
  const caseFlagGroup2PartyName = 'Barry Ster';
  const caseFlagGroup2RoleOnCase = 'Plaintiff';
  const caseFlagGroup2DetailsValue1 = {
    name: 'Other - Group 2 Flag 1',
    dateTimeModified: '2023-09-19T01:00:00.000',
    dateTimeCreated: '2023-09-19T00:00:00.000',
    path: [{ id: null, value: 'Party' }],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlagGroup2FieldId2 = 'GroupedCaseFlag2b';
  const caseFlagGroup2DetailsValue2 = {
    name: 'Other - Group 2 Flag 2',
    dateTimeModified: '2023-09-19T01:00:00.000',
    dateTimeCreated: '2023-09-19T00:00:00.000',
    path: [{ id: null, value: 'Party' }],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
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
                flagLauncher1CaseField,
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
                        id: witnessCaseFlagGroupInternalFieldId,
                        field_type: {
                          id: 'Flags',
                          type: 'Complex'
                        }
                      } as CaseField,
                      {
                        id: witnessCaseFlagGroupExternalFieldId,
                        field_type: {
                          id: 'Flags',
                          type: 'Complex'
                        }
                      } as CaseField
                    ]
                  },
                  value: witnessComplexFieldValue
                },
                {
                  id: caseFlagGroup1FieldId1,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlagGroup1PartyName,
                    roleOnCase: caseFlagGroup1RoleOnCase,
                    details: [
                      {
                        id: '5caf3ee8-7895-4e33-a3f2-b97e67fb35eb',
                        value: caseFlagGroup1DetailsValue1
                      }
                    ],
                    groupId: caseFlagGroup1Id
                  }
                },
                {
                  id: caseFlagGroup1FieldId2,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlagGroup1PartyName,
                    roleOnCase: caseFlagGroup1RoleOnCase,
                    details: [
                      {
                        id: '6516b3e2-12f7-40d6-af7b-1c1b1f1e730a',
                        value: caseFlagGroup1DetailsValue2
                      }
                    ],
                    groupId: caseFlagGroup1Id
                  }
                },
                {
                  id: caseFlagGroup2FieldId1,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlagGroup2PartyName,
                    roleOnCase: caseFlagGroup2RoleOnCase,
                    details: [
                      {
                        id: '407f09e4-84e5-47b2-8269-3fd26a54ca19',
                        value: caseFlagGroup2DetailsValue1
                      }
                    ],
                    groupId: caseFlagGroup2Id
                  }
                },
                {
                  id: caseFlagGroup2FieldId2,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlagGroup2PartyName,
                    roleOnCase: caseFlagGroup2RoleOnCase,
                    details: [
                      {
                        id: '7a5e67bf-25c3-4b60-a293-541237fb2a39',
                        value: caseFlagGroup2DetailsValue2
                      }
                    ],
                    groupId: caseFlagGroup2Id
                  }
                }
              ]
            },
            {
              id: 'Support',
              fields: [
                flagLauncher2CaseField,
                {
                  id: caseFlag3FieldId,
                  field_type: {
                    id: 'Flags',
                    type: 'Complex'
                  },
                  value: {
                    partyName: caseFlag3PartyName,
                    roleOnCase: caseFlag3RoleOnCase,
                    details: [
                      {
                        id: '6e8784ca-d679-4f36-a986-edc6ad255dfa',
                        value: caseFlag3DetailsValue1
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
            PartyFlagsInternal: {
              partyName: witnessCaseFlagPartyName,
              roleOnCase: witnessCaseFlagRoleOnCase,
              details: [
                ...witnessComplexFieldInternalFlagDetailsArray,
                {
                  value: {
                    name: 'New flag in Witness field'
                  }
                }
              ],
              groupId: witnessCaseFlagGroupId
            },
            PartyFlagsExternal: {
              partyName: witnessCaseFlagPartyName,
              roleOnCase: witnessCaseFlagRoleOnCase,
              details: [
                ...witnessComplexFieldExternalFlagDetailsArray,
                {
                  value: {
                    name: 'Another new flag in Witness field'
                  }
                }
              ],
              groupId: witnessCaseFlagGroupId
            }
          }
        }
      },
      [flagLauncher1CaseField.id]: {
        controls: {},
        caseField: flagLauncher1CaseField,
        component: new WriteCaseFlagFieldComponent(null, new CaseEditDataService(), new CaseFlagStateService(), null)
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
    pathToFlagsFormGroup: `${witnessComplexFieldId}.${witnessCaseFlagGroupInternalFieldId}`,
    caseField: formGroup.controls[witnessComplexFieldId]['caseField']
  } as FlagsWithFormGroupPath;
  let caseFlagStateServiceSpy: jasmine.SpyObj<CaseFlagStateService>;

  beforeEach(waitForAsync(() => {
    caseFlagStateServiceSpy = jasmine.createSpyObj('CaseFlagStateService', ['resetCache']);
    caseFlagStateServiceSpy.formGroup = formGroup;
    caseFlagStateServiceSpy.pageLocation = '../createCaseFlag/createCaseFlagCaseFlagFormPage';
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS;

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ReadCaseFlagFieldComponent, MockRpxTranslatePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseFlagStateService, useValue: caseFlagStateServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadCaseFlagFieldComponent);
    component = fixture.componentInstance;
    component.caseField = flagLauncher1CaseField;
    component.formGroup = formGroup;
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set whether the user is external or not, from the display_context_parameter', () => {
    expect(component.caseFlagsExternalUser).toBe(false);
    formGroup.get(flagLauncher1CaseField.id)['component'].caseField = {
      display_context_parameter: CaseFlagDisplayContextParameter.READ_EXTERNAL
    };
    component.ngOnInit();
    expect(component.displayContextParameter).toBe(CaseFlagDisplayContextParameter.READ_EXTERNAL);
    expect(component.caseFlagsExternalUser).toBe(true);
  });

  it('should extract all flags-related data from the CaseView object in the snapshot data, grouping flags by groupId', () => {
    // Flags data is grouped by groupId where present, if the user is not external (the default)
    formGroup.get(flagLauncher1CaseField.id)['component'].caseField = {
      display_context_parameter: null
    };
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(9);
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
    expect(component.flagsData[3].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.flagsData[3].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[3].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    // Flags will have been grouped so, due to shared object references, the flags details array length will be 2 not 1
    expect(component.flagsData[3].flags.details.length).toBe(2);
    expect(component.flagsData[3].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[3].flags.details[1].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.flagsData[4].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupExternalFieldId);
    expect(component.flagsData[4].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[4].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    expect(component.flagsData[4].flags.details.length).toBe(1);
    expect(component.flagsData[4].flags.details[0].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.flagsData[5].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.flagsData[5].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[5].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[5].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue1.name);
    expect(component.flagsData[6].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId2);
    expect(component.flagsData[6].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[6].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[6].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue2.name);
    expect(component.flagsData[7].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.flagsData[7].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[7].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[7].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue1.name);
    expect(component.flagsData[8].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId2);
    expect(component.flagsData[8].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[8].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[8].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue2.name);
    // Check the party-level and case-level flags are separated correctly, and the party-level flags are grouped by
    // groupId (i.e. there are no duplicate parties). These are expected to appear before the non-grouped flags
    expect(component.partyLevelCaseFlagData.length).toBe(5);
    expect(component.partyLevelCaseFlagData[0].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.partyLevelCaseFlagData[0].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.partyLevelCaseFlagData[0].flags.details.length).toBe(2);
    expect(component.partyLevelCaseFlagData[0].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.partyLevelCaseFlagData[0].flags.details[1].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[1].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.partyLevelCaseFlagData[1].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.partyLevelCaseFlagData[1].flags.details.length).toBe(2);
    expect(component.partyLevelCaseFlagData[1].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue1.name);
    expect(component.partyLevelCaseFlagData[1].flags.details[1].name).toEqual(caseFlagGroup1DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[2].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.partyLevelCaseFlagData[2].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.partyLevelCaseFlagData[2].flags.details.length).toBe(2);
    expect(component.partyLevelCaseFlagData[2].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue1.name);
    expect(component.partyLevelCaseFlagData[2].flags.details[1].name).toEqual(caseFlagGroup2DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[3].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.partyLevelCaseFlagData[4].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.caseLevelCaseFlagData).toEqual(component.flagsData[2]);
  });

  it('should extract all flags-related data from the CaseView object in the snapshot data, not grouping flags by groupId', () => {
    // Flags data is not grouped by groupId where present, if the user is external
    formGroup.get(flagLauncher1CaseField.id)['component'].caseField = {
      display_context_parameter: CaseFlagDisplayContextParameter.READ_EXTERNAL
    };
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(9);
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
    expect(component.flagsData[3].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.flagsData[3].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[3].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    expect(component.flagsData[3].flags.details.length).toBe(1);
    expect(component.flagsData[3].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[4].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupExternalFieldId);
    expect(component.flagsData[4].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[4].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    expect(component.flagsData[4].flags.details.length).toBe(1);
    expect(component.flagsData[4].flags.details[0].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.flagsData[5].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.flagsData[5].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[5].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[5].flags.details.length).toBe(1);
    expect(component.flagsData[5].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue1.name);
    expect(component.flagsData[6].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId2);
    expect(component.flagsData[6].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[6].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[6].flags.details.length).toBe(1);
    expect(component.flagsData[6].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue2.name);
    expect(component.flagsData[7].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.flagsData[7].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[7].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[7].flags.details.length).toBe(1);
    expect(component.flagsData[7].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue1.name);
    expect(component.flagsData[8].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId2);
    expect(component.flagsData[8].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[8].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[8].flags.details.length).toBe(1);
    expect(component.flagsData[8].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue2.name);
    // Check the party-level (non-grouped) and case-level flags are separated correctly
    expect(component.partyLevelCaseFlagData.length).toBe(8);
    expect(component.partyLevelCaseFlagData[0].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.partyLevelCaseFlagData[1].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.partyLevelCaseFlagData[2].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.partyLevelCaseFlagData[3].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupExternalFieldId);
    expect(component.partyLevelCaseFlagData[4].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.partyLevelCaseFlagData[5].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId2);
    expect(component.partyLevelCaseFlagData[6].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.partyLevelCaseFlagData[7].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId2);
    expect(component.caseLevelCaseFlagData).toEqual(component.flagsData[2]);
  });

  it('should extract all flags-related data from the CaseView object, grouping flags by groupId, where flags.details is null', () => {
    // Flags data is grouped by groupId where present, if the user is not external (the default)
    formGroup.get(flagLauncher1CaseField.id)['component'].caseField = {
      display_context_parameter: null
    };
    // Check that code to merge internal and external flag collections still works if a flag details array is falsy
    witnessComplexFieldValue.PartyFlagsInternal.details = null;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(9);
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
    expect(component.flagsData[3].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.flagsData[3].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[3].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    // Flags will have been grouped so, due to shared object references, the flags details array length will be 1 not 0
    // (external flags array with one flag will have been merged with an empty internal flags array)
    expect(component.flagsData[3].flags.details.length).toBe(1);
    expect(component.flagsData[3].flags.details[0].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.flagsData[4].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupExternalFieldId);
    expect(component.flagsData[4].flags.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagsData[4].flags.roleOnCase).toEqual(witnessCaseFlagRoleOnCase);
    expect(component.flagsData[4].flags.details.length).toBe(1);
    expect(component.flagsData[4].flags.details[0].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.flagsData[5].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.flagsData[5].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[5].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[5].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue1.name);
    expect(component.flagsData[6].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId2);
    expect(component.flagsData[6].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.flagsData[6].flags.roleOnCase).toEqual(caseFlagGroup1RoleOnCase);
    expect(component.flagsData[6].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue2.name);
    expect(component.flagsData[7].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.flagsData[7].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[7].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[7].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue1.name);
    expect(component.flagsData[8].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId2);
    expect(component.flagsData[8].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.flagsData[8].flags.roleOnCase).toEqual(caseFlagGroup2RoleOnCase);
    expect(component.flagsData[8].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue2.name);
    // Check the party-level and case-level flags are separated correctly, and the party-level flags are grouped by
    // groupId (i.e. there are no duplicate parties). These are expected to appear before the non-grouped flags
    expect(component.partyLevelCaseFlagData.length).toBe(5);
    expect(component.partyLevelCaseFlagData[0].flags.flagsCaseFieldId).toEqual(witnessCaseFlagGroupInternalFieldId);
    expect(component.partyLevelCaseFlagData[0].flags.partyName).toEqual(witnessCaseFlagPartyName);
    // The grouped flags details array length should be 1 (external flags array with one flag will have been merged
    // with an empty internal flags array)
    expect(component.partyLevelCaseFlagData[0].flags.details.length).toBe(1);
    expect(component.partyLevelCaseFlagData[0].flags.details[0].name).toEqual(caseFlag1DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[1].flags.flagsCaseFieldId).toEqual(caseFlagGroup1FieldId1);
    expect(component.partyLevelCaseFlagData[1].flags.partyName).toEqual(caseFlagGroup1PartyName);
    expect(component.partyLevelCaseFlagData[1].flags.details.length).toBe(2);
    expect(component.partyLevelCaseFlagData[1].flags.details[0].name).toEqual(caseFlagGroup1DetailsValue1.name);
    expect(component.partyLevelCaseFlagData[1].flags.details[1].name).toEqual(caseFlagGroup1DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[2].flags.flagsCaseFieldId).toEqual(caseFlagGroup2FieldId1);
    expect(component.partyLevelCaseFlagData[2].flags.partyName).toEqual(caseFlagGroup2PartyName);
    expect(component.partyLevelCaseFlagData[2].flags.details.length).toBe(2);
    expect(component.partyLevelCaseFlagData[2].flags.details[0].name).toEqual(caseFlagGroup2DetailsValue1.name);
    expect(component.partyLevelCaseFlagData[2].flags.details[1].name).toEqual(caseFlagGroup2DetailsValue2.name);
    expect(component.partyLevelCaseFlagData[3].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.partyLevelCaseFlagData[4].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.caseLevelCaseFlagData).toEqual(component.flagsData[2]);
  });

  it('should extract the correct flags-related data for a given FlagLauncher field instance', () => {
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(9);
    expect(component.flagsData[0].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].flags.details.length).toBe(2);
    expect(component.flagsData[0].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    component.caseField = flagLauncher2CaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(1);
    expect(component.flagsData[0].flags.flagsCaseFieldId).toEqual(caseFlag3FieldId);
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag3PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag3RoleOnCase);
    expect(component.flagsData[0].flags.details.length).toBe(1);
    expect(component.flagsData[0].flags.details[0].name).toEqual(caseFlag3DetailsValue1.name);
  });

  it('should not map a Flags case field to a Flags object when the case field value is falsy', () => {
    // Clear caseField.value for both party-level case flags
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value = null;
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value = undefined;
    component.ngOnInit();
    expect(component.flagsData.length).toBe(7);
  });

  xit('should map a Flags case field to a Flags object even if it has no flag details', () => {
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[1].value.details = null;
    TestBed.inject(ActivatedRoute).snapshot.data.case.tabs[2].fields[2].value.details = undefined;
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE
    };
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocation)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].flags.details).toBeNull();
    expect(component.flagsData[1].flags.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].flags.roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].flags.details).toBeNull();
  });

  it('should select the correct (i.e. new) flag to display on the summary page, as part of the Create Case Flag journey v1', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE
    };
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocation)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag'} as FlagDetail);
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.CREATE);
  });

  it('should select the correct (i.e. new) flag to display on the summary page, as part of the Create Case Flag journey v2.1', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE_2_POINT_1
    };
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocation)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag'} as FlagDetail);
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.CREATE_2_POINT_1);
  });

  it('should select the correct (i.e. new) flag to display on the summary page, as part of the Request Support journey for legal reps', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE_EXTERNAL
    };
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocation)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag'} as FlagDetail);
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.CREATE_EXTERNAL);
  });

  it('should select the correct (i.e. new) flag to display on the summary page, when the flag is contained in a Complex field', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE
    };
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocationInComplexField)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeTruthy();
    expect(component.flagForSummaryDisplay.partyName).toEqual(witnessCaseFlagPartyName);
    expect(component.flagForSummaryDisplay.flagDetail).toEqual({name: 'New flag in Witness field'} as FlagDetail);
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.CREATE);
  });

  it('should show nothing on the summary page if the flag\'s CaseField object has no value', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.CREATE
    };
    selectedFlagsLocation.caseField.value = null;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseFlagParentFormGroup'] = new FormGroup({
      selectedLocation: new FormControl(selectedFlagsLocation)
    });
    component.formGroup = formGroup;
    component.ngOnInit();
    expect(component.flagForSummaryDisplay).toBeNull();
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.CREATE);
  });

  it('should select the correct (i.e. selected) flag to display on the summary page, as part of the Manage Case Flags journey v1', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.UPDATE
    };
    component.formGroup = formGroup;
    // Simulate presence of selected flag
    formGroup.controls[flagLauncher1CaseField.id]['component'].selectedFlag = {
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
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.UPDATE);
  });

  it('should select the correct (i.e. selected) flag to display on the summary page, as part of the Manage Case Flags journey v2.1', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.UPDATE_2_POINT_1
    };
    component.formGroup = formGroup;
    // Simulate presence of selected flag
    formGroup.controls[flagLauncher1CaseField.id]['component'].selectedFlag = {
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
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.UPDATE_2_POINT_1);
  });

  it('should select the correct (i.e. selected) flag to display on the summary page, as part of the Manage Support journey for legal reps', () => {
    component.context = PaletteContext.CHECK_YOUR_ANSWER;
    formGroup.controls[flagLauncher1CaseField.id]['component']['caseField'] = {
      display_context_parameter: CaseFlagDisplayContextParameter.UPDATE_EXTERNAL
    };
    component.formGroup = formGroup;
    // Simulate presence of selected flag
    formGroup.controls[flagLauncher1CaseField.id]['component'].selectedFlag = {
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
    // Check the correct display context parameter for the "Review flag details" summary page has been set
    expect(component.displayContextParameter).toEqual(CaseFlagDisplayContextParameter.UPDATE_EXTERNAL);
  });

  it('should navigate back to form with field state', fakeAsync(() => {
    spyOn(router, 'navigate').and.callThrough();

    const fieldState = 123;
    caseFlagStateServiceSpy.pageLocation = '../createCaseFlag/createCaseFlagCaseFlagFormPage';
    component.navigateBackToForm(fieldState);
    tick();

    expect(router.navigate).toHaveBeenCalledWith([`../${caseFlagStateServiceSpy.pageLocation}`], { relativeTo: route });
  }));
});
