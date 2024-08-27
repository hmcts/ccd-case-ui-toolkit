import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CaseField, FieldType } from '../../../../../domain';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagDisplayContextParameter, CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagErrorMessage } from '../../enums';
import { ManageCaseFlagsLabelDisplayPipe } from '../../pipes';
import { ManageCaseFlagsComponent } from './manage-case-flags.component';

describe('ManageCaseFlagsComponent', () => {
  let component: ManageCaseFlagsComponent;
  let fixture: ComponentFixture<ManageCaseFlagsComponent>;
  let mockRpxTranslationService: any;
  const flag1 = {
    name: 'Flag 1',
    flagComment: 'First flag',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  };
  const flag2 = {
    name: 'Flag 2',
    flagComment: 'Rose\'s second flag',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'FL2',
    status: 'Inactive'
  };
  const flagX = {
    name: 'Flag X',
    flagComment: 'Flag not approved',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Not approved'
  };
  const flag3 = {
    name: 'Flag 3',
    flagComment: 'First flag',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  };
  const flag4 = {
    name: 'Flag 4',
    flagComment: 'Fourth flag',
    dateTimeCreated: new Date(),
    path: [
      { id: null, value: 'Level 1' },
      { id: null, value: 'Level 2' }
    ],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active'
  };
  const flag5 = {
    name: 'Flag 5',
    name_cy: 'Fflag 5',
    flagComment: 'Fifth flag',
    flagComment_cy: 'Fifth flag - Welsh',
    dateTimeCreated: new Date(),
    path: [
      { id: null, value: 'Level 1' }
    ],
    hearingRelevant: false,
    flagCode: 'FL1',
    status: 'Active',
    subTypeKey: 'Dummy subtype key',
    subTypeValue: 'Dummy subtype value',
    subTypeValue_cy: 'Dummy subtype value - Welsh'
  };
  const activeFlagWithOtherDescription = {
    name: 'Flag 1',
    flagComment: 'First flag',
    flagComment_cy: 'Cymraeg',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'OT0001',
    status: 'Active',
    otherDescription: 'Description'
  } as FlagDetail;
  const activeFlagWithOtherDescriptionCy = {
    name: 'Flag 1',
    flagComment: 'First flag',
    flagComment_cy: 'Cymraeg',
    dateTimeCreated: new Date(),
    path: [{ id: null, value: 'Reasonable adjustment' }],
    hearingRelevant: false,
    flagCode: 'OT0001',
    status: 'Active',
    otherDescription_cy: 'Description (Welsh)'
  } as FlagDetail;
  const flagsData = [
    {
      flags: {
        partyName: 'Rose Bank',
        details: [
          {
            id: '95de3cde-9f1b-468b-863b-8bc29ce7e600',
            ...flag1
          },
          {
            id: '34aaf022-19f2-4b03-b78c-6e73fc29e3f2',
            ...flag2
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag1',
        visibility: 'Internal'
      },
      pathToFlagsFormGroup: 'CaseFlag1',
      caseField: {
        id: 'CaseFlag1',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          partyName: 'Rose Bank',
          details: [
            {
              id: '95de3cde-9f1b-468b-863b-8bc29ce7e600',
              value: { ...flag1, status: 'Requested' }
            },
            {
              id: '34aaf022-19f2-4b03-b78c-6e73fc29e3f2',
              value: { ...flag2 }
            }
          ]
        },
        value: {
          partyName: 'Rose Bank',
          details: [
            {
              id: '95de3cde-9f1b-468b-863b-8bc29ce7e600',
              value: { ...flag1 }
            },
            {
              id: '34aaf022-19f2-4b03-b78c-6e73fc29e3f2',
              value: { ...flag2 }
            }
          ]
        }
      } as CaseField
    },
    {
      flags: {
        partyName: 'Tom Atin',
        details: [
          {
            id: 'd9348799-1532-444a-b577-cd546e2f58f1',
            ...flagX
          },
          {
            id: '013abc9c-738c-4634-85fa-2910a8cd40a4',
            ...flag3
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag2',
        visibility: 'External'
      },
      pathToFlagsFormGroup: 'CaseFlag2',
      caseField: {
        id: 'CaseFlag2',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          partyName: 'Tom Atin',
          details: [
            {
              id: 'd9348799-1532-444a-b577-cd546e2f58f1',
              value: { ...flagX }
            },
            {
              id: '013abc9c-738c-4634-85fa-2910a8cd40a4',
              value: { ...flag3, status: 'Requested' }
            }
          ]
        },
        value: {
          partyName: 'Tom Atin',
          details: [
            {
              id: 'd9348799-1532-444a-b577-cd546e2f58f1',
              value: { ...flagX }
            },
            {
              id: '013abc9c-738c-4634-85fa-2910a8cd40a4',
              value: { ...flag3 }
            }
          ]
        }
      } as CaseField
    },
    {
      flags: {
        partyName: '',
        details: [
          {
            id: '573ce187-abae-4121-81d3-53fbba074e62',
            ...flag4
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          partyName: '',
          details: [
            {
              id: '573ce187-abae-4121-81d3-53fbba074e62',
              value: { ...flag4, status: 'Requested' }
            }
          ]
        },
        value: {
          partyName: '',
          details: [
            {
              id: '573ce187-abae-4121-81d3-53fbba074e62',
              value: { ...flag4 }
            }
          ]
        }
      } as CaseField
    },
    {
      flags: {
        partyName: '',
        details: [
          {
            id: 'aa692b36-9dc0-43de-b5f8-2dba78664376',
            ...flag5
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          partyName: '',
          details: [
            {
              id: 'aa692b36-9dc0-43de-b5f8-2dba78664376',
              value: { ...flag5, status: 'Requested' }
            }
          ]
        },
        value: {
          partyName: '',
          details: [
            {
              id: 'aa692b36-9dc0-43de-b5f8-2dba78664376',
              value: { ...flag5 }
            }
          ]
        }
      } as CaseField
    }
  ] as FlagsWithFormGroupPath[];

  const updateMode = '#ARGUMENT(UPDATE)';
  const updateExternalMode = '#ARGUMENT(UPDATE,EXTERNAL)';

  beforeEach(waitForAsync(() => {
    const source = new BehaviorSubject<RpxLanguage>('en');
    let currentLanguage: RpxLanguage = 'en';
    mockRpxTranslationService = {
      language$: source.asObservable(),
      set language(lang: RpxLanguage) {
        currentLanguage = lang;
        source.next(lang);
      },
      get language(): RpxLanguage {
        return currentLanguage;
      },
      getTranslation(_: string): Observable<string> {
        return of('Dummy Welsh translation');
      }
    };
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [ManageCaseFlagsComponent, MockRpxTranslatePipe, ManageCaseFlagsLabelDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageCaseFlagsComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    component.flagsData = flagsData;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set an error condition if the case has no flags', () => {
    component.flagsData = [];
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.ngOnInit();
    expect(component.flagsDisplayData).toEqual([]);
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagErrorMessage.NO_FLAGS,
      fieldId: 'conditional-radios-list'
    });
    expect(component.noFlagsError).toBe(true);
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: component.errorMessages
    });
    fixture.detectChanges();
    // The "Next" button should not be present if the error condition has been set
    const nextButtonElement = fixture.debugElement.nativeElement.querySelector('.button');
    expect(nextButtonElement).toBeNull();
  });

  it('should map flag details to display model', () => {
    const flagDetail = {
      name: 'Interpreter',
      dateTimeCreated: new Date(),
      path: [{ id: null, value: 'path' }],
      flagComment: 'comment',
      hearingRelevant: true,
      flagCode: '123',
      status: 'active'
    } as FlagDetail;
    const flagsInstance: FlagsWithFormGroupPath = {
      caseField: {
        id: 'CaseFlag2'
      } as CaseField,
      flags: {
        flagsCaseFieldId: 'CaseFlag2',
        partyName: 'Wayne Sleep'
      },
      pathToFlagsFormGroup: 'CaseFlag2'
    };

    const displayResult = component.mapFlagDetailForDisplay(flagDetail, flagsInstance);
    expect(displayResult.flagDetailDisplay.partyName).toEqual(flagsInstance.flags.partyName);
    expect(displayResult.flagDetailDisplay.flagDetail.name).toEqual(flagDetail.name);
    expect(displayResult.flagDetailDisplay.flagDetail.flagComment).toEqual(flagDetail.flagComment);
    expect(displayResult.flagDetailDisplay.flagDetail.flagCode).toEqual(flagDetail.flagCode);
    expect(displayResult.originalStatus).toBeUndefined();
    expect(displayResult.pathToFlagsFormGroup).toEqual(flagsInstance.flags.flagsCaseFieldId);
  });

  it('should map all parties and their flags to a single array for display purposes, excluding "Inactive" and "Not approved"', () => {
    expect(component.flagsDisplayData).toBeTruthy();
    expect(component.flagsDisplayData.length).toBe(4);
    // Check correct mapping of the first party's flags
    expect(component.flagsDisplayData[0].flagDetailDisplay.partyName).toEqual(flagsData[0].flags.partyName);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.name).toEqual(flagsData[0].flags.details[0].name);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[0].flags.details[0].flagComment);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[0].flags.details[0].flagCode);
    expect(component.flagsDisplayData[0].pathToFlagsFormGroup).toEqual(flagsData[0].pathToFlagsFormGroup);
    expect(component.flagsDisplayData[0].originalStatus).toEqual(flagsData[0].caseField.formatted_value.details[0].value.status);
    expect(component.flagsDisplayData[0].flagDetailDisplay.visibility).toEqual(flagsData[0].flags.visibility);
    // Check correct mapping of the second party's flags
    expect(component.flagsDisplayData[1].flagDetailDisplay.partyName).toEqual(flagsData[1].flags.partyName);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.name).toEqual(flagsData[1].flags.details[1].name);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[1].flags.details[1].flagComment);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[1].flags.details[1].flagCode);
    expect(component.flagsDisplayData[1].pathToFlagsFormGroup).toEqual(flagsData[1].pathToFlagsFormGroup);
    expect(component.flagsDisplayData[1].originalStatus).toEqual(flagsData[1].caseField.formatted_value.details[1].value.status);
    // Check correct mapping of the third party's flags
    expect(component.flagsDisplayData[2].flagDetailDisplay.partyName).toEqual(flagsData[2].flags.partyName);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.name).toEqual(flagsData[2].flags.details[0].name);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[2].flags.details[0].flagComment);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[2].flags.details[0].flagCode);
    expect(component.flagsDisplayData[2].pathToFlagsFormGroup).toEqual(flagsData[2].pathToFlagsFormGroup);
    expect(component.flagsDisplayData[2].originalStatus).toEqual(flagsData[2].caseField.formatted_value.details[0].value.status);
    // Check correct mapping of the fourth party's flags
    expect(component.flagsDisplayData[3].flagDetailDisplay.partyName).toEqual(flagsData[3].flags.partyName);
    expect(component.flagsDisplayData[3].flagDetailDisplay.flagDetail.name).toEqual(flagsData[3].flags.details[0].name);
    expect(component.flagsDisplayData[3].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[3].flags.details[0].flagComment);
    expect(component.flagsDisplayData[3].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[3].flags.details[0].flagCode);
    expect(component.flagsDisplayData[3].pathToFlagsFormGroup).toEqual(flagsData[3].pathToFlagsFormGroup);
    expect(component.flagsDisplayData[3].originalStatus).toEqual(flagsData[3].caseField.formatted_value.details[0].value.status);
  });

  it('should map a flag instance for display, where the parent Flags object is a sub-field of a Complex type', () => {
    const flag1Detail = {
      id: 'a3e71b29-3f4c-4f60-850c-f002a4d686a8',
      ...flag1
    } as FlagDetail;
    const flagsInstance = {
      flags: {
        partyName: 'Ruki Tsunama',
        details: [
          flag1Detail,
          {
            id: '5fa87240-1856-45a3-9fa7-4dcc8b559396',
            ...flag2
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'Witness1'
      },
      pathToFlagsFormGroup: 'Witness1.partyFlags',
      caseField: {
        id: 'Witness1',
        field_type: {
          id: 'Witness',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          firstName: 'Ruki',
          lastName: 'Tsunama',
          partyFlags: {
            partyName: 'Ruki Tsunama',
            details: [
              {
                id: 'a3e71b29-3f4c-4f60-850c-f002a4d686a8',
                value: { ...flag1, status: 'Requested' }
              },
              {
                id: '5fa87240-1856-45a3-9fa7-4dcc8b559396',
                value: { ...flag2 }
              }
            ]
          }
        },
        value: {
          firstName: 'Ruki',
          lastName: 'Tsunama',
          partyFlags: {
            partyName: 'Ruki Tsunama',
            details: [
              {
                id: 'a3e71b29-3f4c-4f60-850c-f002a4d686a8',
                value: { ...flag1 }
              },
              {
                id: '5fa87240-1856-45a3-9fa7-4dcc8b559396',
                value: { ...flag2 }
              }
            ]
          }
        }
      } as CaseField
    } as FlagsWithFormGroupPath;
    const flagDetailMappedForDisplay = component.mapFlagDetailForDisplay(flag1Detail, flagsInstance);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.partyName).toEqual(flagsInstance.flags.partyName);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail).toEqual(flag1Detail);
    expect(flagDetailMappedForDisplay.pathToFlagsFormGroup).toEqual(flagsInstance.pathToFlagsFormGroup);
    expect(flagDetailMappedForDisplay.originalStatus).toEqual(flagsInstance.caseField.formatted_value.partyFlags.details[0].value.status);
  });

  it('should not cache any changes to the comments and description fields (English and Welsh) if the user starts over', () => {
    const flagWithOtherDescriptionDetail = {
      id: 'a6073742-f616-4a6a-a412-a0e60f47dc32',
      ...activeFlagWithOtherDescription
    } as FlagDetail;
    const flagsInstance = {
      flags: {
        partyName: 'Rose Bank',
        details: [flagWithOtherDescriptionDetail] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag'
      },
      pathToFlagsFormGroup: 'CaseFlag',
      caseField: {
        id: 'CaseFlag',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          partyName: 'Rose Bank',
          details: [
            {
              id: 'a6073742-f616-4a6a-a412-a0e60f47dc32',
              value: { ...activeFlagWithOtherDescription }
            }
          ]
        },
        value: {
          partyName: 'Rose Bank',
          details: [
            {
              id: 'a6073742-f616-4a6a-a412-a0e60f47dc32',
              value: { ...activeFlagWithOtherDescription }
            }
          ]
        }
      } as CaseField
    } as FlagsWithFormGroupPath;
    // Make some changes to comments and description fields in the flag instance, simulating previous updates via the UI
    flagsInstance.flags.details[0].flagComment = 'A new comment';
    flagsInstance.flags.details[0].flagComment_cy = 'A new comment in Welsh';
    flagsInstance.flags.details[0].otherDescription = 'A new description';
    flagsInstance.flags.details[0].otherDescription_cy = 'A new description in Welsh';
    const flagDetailMappedForDisplay = component.mapFlagDetailForDisplay(flagWithOtherDescriptionDetail, flagsInstance);
    // Expect all four fields to have been reset to the original persisted values
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.flagComment).toEqual(
      flagsInstance.caseField.formatted_value.details[0].value.flagComment);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.flagComment_cy).toEqual(
      flagsInstance.caseField.formatted_value.details[0].value.flagComment_cy);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.otherDescription).toEqual(
      flagsInstance.caseField.formatted_value.details[0].value.otherDescription);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.otherDescription_cy).toEqual(
      flagsInstance.caseField.formatted_value.details[0].value.otherDescription_cy);
  });

  it('should not cache changes to comments and description fields where flag is within a Complex type, if the user starts over', () => {
    const flagWithOtherDescriptionCyDetail = {
      id: 'b43d9d2c-9f9f-4514-b182-508cfe19550e',
      ...activeFlagWithOtherDescriptionCy
    } as FlagDetail;
    const flagsInstance = {
      flags: {
        partyName: 'Rose Bank',
        details: [flagWithOtherDescriptionCyDetail] as FlagDetail[],
        flagsCaseFieldId: 'Witness1'
      },
      pathToFlagsFormGroup: 'Witness1.partyFlags',
      caseField: {
        id: 'Witness1',
        field_type: {
          id: 'Witness',
          type: 'Complex'
        } as FieldType,
        formatted_value: {
          firstName: 'Rose',
          lastName: 'Bank',
          partyFlags: {
            partyName: 'Rose Bank',
            details: [
              {
                id: 'b43d9d2c-9f9f-4514-b182-508cfe19550e',
                value: { ...activeFlagWithOtherDescriptionCy }
              }
            ]
          }
        },
        value: {
          firstName: 'Rose',
          lastName: 'Bank',
          partyFlags: {
            partyName: 'Rose Bank',
            details: [
              {
                id: 'b43d9d2c-9f9f-4514-b182-508cfe19550e',
                value: { ...activeFlagWithOtherDescriptionCy }
              }
            ]
          }
        }
      } as CaseField
    } as FlagsWithFormGroupPath;
    // Make some changes to comments and description fields in the flag instance, simulating previous updates via the UI
    flagsInstance.flags.details[0].flagComment = 'A new comment';
    flagsInstance.flags.details[0].flagComment_cy = 'A new comment in Welsh';
    flagsInstance.flags.details[0].otherDescription = 'A new description';
    flagsInstance.flags.details[0].otherDescription_cy = 'A new description in Welsh';
    const flagDetailMappedForDisplay = component.mapFlagDetailForDisplay(flagWithOtherDescriptionCyDetail, flagsInstance);
    // Expect all four fields to have been reset to the original persisted values
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.flagComment).toEqual(
      flagsInstance.caseField.formatted_value.partyFlags.details[0].value.flagComment);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.flagComment_cy).toEqual(
      flagsInstance.caseField.formatted_value.partyFlags.details[0].value.flagComment_cy);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.otherDescription).toEqual(
      flagsInstance.caseField.formatted_value.partyFlags.details[0].value.otherDescription);
    expect(flagDetailMappedForDisplay.flagDetailDisplay.flagDetail.otherDescription_cy).toEqual(
      flagsInstance.caseField.formatted_value.partyFlags.details[0].value.otherDescription_cy);
  });

  it('should emit to parent with the selected party and flag details if the validation succeeds', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-selection-1').click();
    nativeElement.querySelector('.button').click();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: component.errorMessages,
      selectedFlag: {
        flagDetailDisplay: {
          partyName: flagsData[1].flags.partyName,
          flagDetail: flagsData[1].flags.details[1],
          flagsCaseFieldId: flagsData[1].flags.flagsCaseFieldId,
          visibility: flagsData[1].flags.visibility
        },
        pathToFlagsFormGroup: flagsData[1].pathToFlagsFormGroup,
        caseField: flagsData[1].caseField,
        roleOnCase: undefined,
        originalStatus: flagsData[1].caseField.formatted_value.details[1].value.status
      } as FlagDetailDisplayWithFormGroupPath
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should fail validation and emit to parent if no flag is selected', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    expect(component.flagsDisplayData.length).toBe(4);
    expect(component.noFlagsError).toBe(false);
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: component.errorMessages,
      selectedFlag: null
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagErrorMessage.MANAGE_CASE_FLAGS_FLAG_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const flagNotSelectedErrorMessageElement = nativeElement.querySelector('#manage-case-flag-not-selected-error-message');
    expect(flagNotSelectedErrorMessageElement.textContent).toContain(SelectFlagErrorMessage.MANAGE_CASE_FLAGS_FLAG_NOT_SELECTED);
  });

  it('should show the right validation message based on displayContextParameter', () => {
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    // @ts-expect-error - property is private
    component.validateSelection();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagErrorMessage.MANAGE_CASE_FLAGS_FLAG_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });

    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    // @ts-expect-error - property is private
    component.validateSelection();
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagErrorMessage.MANAGE_SUPPORT_FLAG_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
  });

  it('should set Manage Case Flags component title correctly', () => {
    expect(component.setManageCaseFlagTitle(CaseFlagDisplayContextParameter.UPDATE)).toEqual(CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS);
    expect(component.setManageCaseFlagTitle(CaseFlagDisplayContextParameter.UPDATE_EXTERNAL)).toEqual(CaseFlagWizardStepTitle.MANAGE_SUPPORT);
    expect(component.setManageCaseFlagTitle(CaseFlagDisplayContextParameter.UPDATE_2_POINT_1)).toEqual(CaseFlagWizardStepTitle.MANAGE_CASE_FLAGS);
  });
});
