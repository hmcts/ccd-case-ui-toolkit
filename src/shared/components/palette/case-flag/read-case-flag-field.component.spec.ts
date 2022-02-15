import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { CaseField } from '../../../domain/definition';
import { CaseFlagStatus } from './enums';
import { ReadCaseFlagFieldComponent } from './read-case-flag-field.component';

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
                  id: 'CaseFlag1',
                  field_type: {
                    // TODO: Temporary field type; needs to be changed to "Flags" once the implementation has been changed over
                    id: 'CaseFlag',
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
                  id: 'CaseFlag2',
                  field_type: {
                    // TODO: Temporary field type; needs to be changed to "Flags" once the implementation has been changed over
                    id: 'CaseFlag',
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
                }
              ]
            }
          ]
        }
      }
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ReadCaseFlagFieldComponent],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReadCaseFlagFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should extract all flags-related data from the CaseView object in the snapshot data', () => {
    component.caseField = flagLauncherCaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(2);
    expect(component.flagsData[0].partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].details.length).toBe(2);
    expect(component.flagsData[0].details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].details[0].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[0].details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].details.length).toBe(2);
    expect(component.flagsData[1].details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].details[1].dateTimeModified).toEqual(new Date(caseFlag1DetailsValue1.dateTimeModified));
    expect(component.flagsData[1].details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].details[1].hearingRelevant).toBe(true);
  });
});
