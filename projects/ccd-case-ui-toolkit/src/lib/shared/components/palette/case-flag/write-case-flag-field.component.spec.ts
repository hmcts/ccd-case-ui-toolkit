import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { FlagType } from '../../../domain/case-flag';
import { CaseField, FieldType } from '../../../domain/definition';
import { MockRpxTranslatePipe } from '../../../test/mock-rpx-translate.pipe';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath, Flags, FlagsWithFormGroupPath } from './domain';
import { CaseFlagDisplayContextParameter, CaseFlagErrorMessage, CaseFlagFieldState, CaseFlagFormFields, CaseFlagStatus } from './enums';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

import createSpy = jasmine.createSpy;
import createSpyObj = jasmine.createSpyObj;

describe('WriteCaseFlagFieldComponent', () => {
  let component: WriteCaseFlagFieldComponent;
  let fixture: ComponentFixture<WriteCaseFlagFieldComponent>;
  let mockRoute: any;
  const flaglauncherId = 'FlagLauncher';
  let flagLauncherCaseField: CaseField;
  const caseFlag1FieldId = 'CaseFlag1';
  const caseFlag1PartyName = 'John Smith';
  const caseFlag1RoleOnCase = 'Claimant';
  const caseFlag1DetailsValue1 = {
    id: '6e8784ca-d679-4f36-a986-edc6ad255dfa',
    name: 'Wheelchair access',
    flagComment: 'A new comment for first party',
    dateTimeModified: '2022-02-13T00:00:00.000',
    dateTimeCreated: '2022-02-11T00:00:00.000',
    path: [
      { id: null, value: 'Party' },
      { id: null, value: 'Reasonable adjustment' },
      { id: null, value: 'Mobility support' }
    ],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag1DetailsValue2 = {
    id: '9a179b7c-50a8-479f-a99b-b191ec8ec192',
    name: 'Sign language',
    flagComment: 'Another new comment for first party',
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
  const caseFlag1DetailsNewValue = {
    id: '0000111122223333',
    name: 'Other',
    dateTimeModified: '2022-06-27T10:15:00.000',
    dateTimeCreated: '2022-06-27T10:00:00.000',
    path: ['Party'],
    hearingRelevant: 'No',
    flagCode: 'OT0001',
    status: CaseFlagStatus.ACTIVE
  };
  const caseFlag2FieldId = 'CaseFlag2';
  const caseFlag2PartyName = 'Ann Peterson';
  const caseFlag2RoleOnCase = 'Defendant';
  const caseFlag2DetailsValue1 = {
    id: '61160453-647b-4065-a786-9443556055f1',
    name: 'Foreign national offender',
    flagComment: 'A new comment for second party',
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
    id: '0629f5cd-52bc-41ac-a2e0-5da9bbee2068',
    name: 'Sign language',
    flagComment: 'Another new comment for second party',
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
  const parentFormGroup = new FormGroup({
    [caseFlag1FieldId]: new FormGroup({}),
    [caseFlag2FieldId]: new FormGroup({})
  });
  parentFormGroup.controls[caseFlag1FieldId]['caseField'] = {
    field_type: {
      id: 'Flags',
      type: 'Complex'
    } as FieldType,
    formatted_value: {
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
    },
  };
  // Set different description, comments, date/time modified, and status values in formatted_value to check they are restored
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.otherDescription = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.otherDescription_cy = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.flagComment = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.flagComment_cy = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.flagUpdateComment = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.otherDescription = 'Original description';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.otherDescription_cy = 'Welsh description';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.flagComment = 'Original new comment 1';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.flagComment_cy = 'Welsh new comment 1';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.flagUpdateComment = 'Status change 1';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.dateTimeModified =
    '2022-02-14T00:00:00.000';
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.status = CaseFlagStatus.ACTIVE;

  parentFormGroup.controls[caseFlag2FieldId]['caseField'] = {
    field_type: {
      id: 'Flags',
      type: 'Complex'
    } as FieldType,
    formatted_value: {
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
        },
        {
          // New value, hence the id is omitted (the test will check this value is removed)
          value: caseFlag1DetailsNewValue
        }
      ]
    },
  };
  // Set different description, comments, date/time modified, and status values in formatted_value to check they are restored
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.otherDescription = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.otherDescription_cy = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.flagComment = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.flagComment_cy = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.flagUpdateComment = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.otherDescription = 'Another description';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.otherDescription_cy = 'Cymraeg';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.flagComment = 'Original new comment 2';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.flagComment_cy = 'Welsh new comment 2';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.flagUpdateComment = 'Status change 2';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.dateTimeModified =
    '2022-02-15T00:00:00.000';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.status = CaseFlagStatus.ACTIVE;

  const selectedFlag = {
    flagDetailDisplay: {
      partyName: caseFlag1PartyName,
      flagDetail: caseFlag1DetailsValue1,
      flagsCaseFieldId: caseFlag1FieldId
    },
    pathToFlagsFormGroup: caseFlag1FieldId,
    caseField: null
  } as FlagDetailDisplayWithFormGroupPath;

  const updateMode = CaseFlagDisplayContextParameter.UPDATE;
  const updateExternalMode = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
  const update2Point1Mode = CaseFlagDisplayContextParameter.UPDATE_2_POINT_1;
  const createMode = CaseFlagDisplayContextParameter.CREATE;
  const createExternalMode = CaseFlagDisplayContextParameter.CREATE_EXTERNAL;
  const create2Point1Mode = CaseFlagDisplayContextParameter.CREATE_2_POINT_1;

  let caseFlagStateServiceSpy: jasmine.SpyObj<CaseFlagStateService>;
  let caseEditDataServiceSpy: jasmine.SpyObj<CaseEditDataService>;
  let rpxTranslationServiceSpy: jasmine.SpyObj<RpxTranslationService>;

  beforeEach(waitForAsync(() => {
    caseFlagStateServiceSpy = createSpyObj<CaseFlagStateService>('CaseFlagStateService', ['resetCache']);
    caseFlagStateServiceSpy.formGroup = new FormGroup({});
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_COMMENTS;
    caseEditDataServiceSpy = createSpyObj<CaseEditDataService>('CaseEditDataService', ['clearFormValidationErrors', 'setTriggerSubmitEvent']);
    rpxTranslationServiceSpy = createSpyObj('RpxTranslationService', ['']);
    rpxTranslationServiceSpy.language = 'en';
    flagLauncherCaseField = {
      id: 'FlagLauncher1',
      field_type: {
        id: flaglauncherId,
        type: flaglauncherId
      },
      display_context_parameter: '#ARGUMENT(CREATE)'
    } as CaseField;
    mockRoute = {
      snapshot: {
        params: {
          eid: 'caseFlag',
          page: 'caseFlagAction',
        },
        data: {
          case: {
            case_id: '1111222233334444',
            case_type: {
              id: 'TEST',
              name: 'Test',
              jurisdiction: {
                id: 'SSCS',
                name: 'Social Security and Child Support'
              }
            }
          },
          eventTrigger: {
            case_fields: [
              flagLauncherCaseField,
              {
                id: caseFlag1FieldId,
                field_type: {
                  id: 'Flags',
                  type: 'Complex'
                } as FieldType,
                formatted_value: {
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
                } as FieldType,
                formatted_value: {
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
                } as FieldType,
                formatted_value: null,
                value: null
              }
            ] as CaseField[],
            supplementary_data: {
              HMCTSServiceId: 'BBA3'
            }
          }
        }
      }
    };

    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ WriteCaseFlagFieldComponent, MockRpxTranslatePipe ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseEditDataService, useValue: caseEditDataServiceSpy },
        { provide: CaseFlagStateService, useValue: caseFlagStateServiceSpy },
        { provide: RpxTranslationService, useValue: rpxTranslationServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteCaseFlagFieldComponent);
    component = fixture.componentInstance;
    spyOn(component, 'setDisplayContextParameter').and.callThrough();
    spyOn(component, 'setDisplayContextParameterUpdate').and.callThrough();
    spyOn(component, 'setDisplayContextParameterExternal').and.callThrough();
    spyOn(component, 'setDisplayContextParameter2Point1Enabled').and.callThrough();
    component.formGroup = parentFormGroup;
    component.caseField = flagLauncherCaseField;
    caseEditDataServiceSpy.caseTitle$ = new BehaviorSubject<string>('Mocked Case Title');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have created a FormGroup with a validator, and set the correct Case Flag field starting state', () => {
    component.displayContextParameter = updateMode;
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_LOCATION;
    component.ngOnInit();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    if (!component.isDisplayContextParameterUpdate) {
      expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_LOCATION);
    }
    // Initial validity of the form is expected to be false because it is at the starting state (only valid at the final state)
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
    expect(component.formGroup.errors).not.toBeNull();
    expect(component.setDisplayContextParameter).toHaveBeenCalledWith(mockRoute.snapshot.data.eventTrigger.case_fields);
    expect(component.setDisplayContextParameterUpdate).toHaveBeenCalledWith(createMode);
  });

  it('should set jurisdiction, caseTypeId, and hmctsServiceId properties from the snapshot data', () => {
    expect(component.jurisdiction).toEqual('SSCS');
    expect(component.caseTypeId).toEqual('TEST');
    expect(component.hmctsServiceId).toEqual('BBA3');
  });

  it('should call setDisplayContextParameter on ngOnInit', () => {
    expect(component.setDisplayContextParameter).toHaveBeenCalledWith(mockRoute.snapshot.data.eventTrigger.case_fields);
  });

  it('should set displayContextParameter string correctly', () => {
    const caseFields: CaseField[] = [
      flagLauncherCaseField
    ];
    caseFields[0].display_context_parameter = updateMode;
    expect(component.setDisplayContextParameter(caseFields)).toEqual(updateMode);
  });

  it('should call setDisplayContextParameterUpdate on ngOnInit', () => {
    expect(component.setDisplayContextParameterUpdate).toHaveBeenCalledWith(component.displayContextParameter);
  });

  it('should set isDisplayContextParameterUpdate boolean correctly', () => {
    expect(component.setDisplayContextParameterUpdate(updateMode)).toBe(true);
    expect(component.setDisplayContextParameterUpdate(updateExternalMode)).toBe(true);
  });

  it('should call setDisplayContextParameterExternal on ngOnInit', () => {
    expect(component.setDisplayContextParameterExternal).toHaveBeenCalledWith(component.displayContextParameter);
  });

  it('when calling setDisplayContextParameterExternal it should return true' +
    'if one of the caseFields have the createExternalMode display_context_parameter', () => {
    expect(component.setDisplayContextParameterExternal(createExternalMode)).toBe(true);
  });

  it('when calling setDisplayContextParameterExternal it should return true' +
    'if one of the caseFields have the updateExternalMode display_context_parameter', () => {
    expect(component.setDisplayContextParameterExternal(updateExternalMode)).toBe(true);
  });

  it('should call setDisplayContextParameter2Point1Enabled on ngOnInit', () => {
    expect(component.setDisplayContextParameter2Point1Enabled).toHaveBeenCalledWith(component.displayContextParameter);
  });

  it('should return true if setDisplayContextParameter2Point1Enabled is called with "CREATE" and "VERSION2.1" arguments', () => {
    expect(component.setDisplayContextParameter2Point1Enabled(create2Point1Mode)).toBe(true);
  });

  it('should return true if setDisplayContextParameter2Point1Enabled is called with "UPDATE" and "VERSION2.1" arguments', () => {
    expect(component.setDisplayContextParameter2Point1Enabled(update2Point1Mode)).toBe(true);
  });

  it('should set the correct Case Flag field starting state for the Manage Case Flags journey', () => {
    // Spy on setDisplayContextParameterUpdate() function and return true (cannot alter display_context_parameter for the
    // flagLauncherCaseField in case_fields of the mock route because this is locked down by compileComponents())
    component.setDisplayContextParameterUpdate = createSpy().and.returnValue(true);
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS;
    component.ngOnInit();
    expect(component.setDisplayContextParameterUpdate).toHaveBeenCalled();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS);
  });

  // TODO: Need to re-visit later as the next button has been moved to the child components
  xit('should move the Case Flag field to the next state, and update the validity if it is at the final state (FLAG_SUMMARY)', () => {
    spyOn(component.formGroup, 'updateValueAndValidity').and.callThrough();
    const nextButton = fixture.debugElement.nativeElement.querySelector('button[type=button]');
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to next state (flag type) but not the final one yet
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_TYPE);
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
    nextButton.click();
    fixture.detectChanges();
    // Field is expected to move to final state (flag status) and the form to become valid
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_STATUS);
    expect(component.isAtFinalState()).toBe(true);
    // Form validation should not be called until reaching the final state, hence expecting only one call
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalledTimes(1);
    expect(component.formGroup.errors).toBeNull();
    expect(component.formGroup.valid).toBe(true);
  });

  it('should extract all flags-related data from the CaseEventTrigger object in the snapshot data', () => {
    component.caseField = flagLauncherCaseField;
    component.ngOnInit();
    expect(component.flagsData).toBeTruthy();
    expect(component.flagsData.length).toBe(3);
    expect(component.flagsData[0].flags.flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].flags.partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].flags.roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].flags.details.length).toBe(2);
    expect(component.flagsData[0].flags.details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].flags.details[0].dateTimeModified).toEqual(null);
    expect(component.flagsData[0].flags.details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].flags.details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].flags.flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].flags.partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].flags.roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].flags.details.length).toBe(2);
    expect(component.flagsData[1].flags.details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].flags.details[1].dateTimeModified).toEqual(new Date(
      parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.dateTimeModified));
    expect(component.flagsData[1].flags.details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].flags.details[1].hearingRelevant).toBe(true);
    expect(component.flagsData[2].flags.flagsCaseFieldId).toEqual(caseFlagsFieldId);
    expect(component.flagsData[2].flags.partyName).toBeNull();
    expect(component.flagsData[2].flags.roleOnCase).toBeNull();
    expect(component.flagsData[2].flags.details).toBeNull();
  });

  // TODO: Need to add tests for when caseField.value is null and caseField.value.details is null
  it('should remove the existing FlagLauncher control from the parent before re-registering', () => {
    spyOn(parentFormGroup, 'removeControl').and.callThrough();
    spyOn(component, 'setFlagsCaseFieldValue');
    // Check the FlagLauncher component control has been registered to the parent FormGroup, and that it is in an invalid
    // state (intentionally)
    const flagLauncherFormGroup = parentFormGroup.get(flagLauncherCaseField.id);
    expect(flagLauncherFormGroup).toBeTruthy();
    expect(flagLauncherFormGroup.invalid).toBe(true);
    expect(flagLauncherFormGroup.errors).not.toBeNull();
    // Move to the final Case Flags stage to make the FlagLauncher control valid
    component.moveToFinalReviewStage();
    expect(flagLauncherFormGroup.invalid).toBe(false);
    expect(flagLauncherFormGroup.errors).toBeNull();
    // Set the component's formGroup reference back to the parent FormGroup (it gets reassigned in ngOnInit())
    component.formGroup = parentFormGroup;
    // Reload the component
    component.ngOnInit();
    expect(parentFormGroup.removeControl).toHaveBeenCalledTimes(1);
  });

  it('should add flag to collection when creating a flag', () => {
    // Check there are two case flag values in the caseField object for caseFlag1 and caseFlag2
    expect(component.flagsData[0].caseField.id).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].caseField.value.details.length).toBe(2);
    expect(component.flagsData[0].caseField.value.details[0].id).toBeTruthy();
    expect(component.flagsData[0].caseField.value.details[0].value).toBeTruthy();
    expect(component.flagsData[0].caseField.value.details[1].id).toBeTruthy();
    expect(component.flagsData[0].caseField.value.details[1].value).toBeTruthy();
    expect(component.flagsData[1].caseField.id).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].caseField.value.details.length).toBe(2);
    expect(component.flagsData[1].caseField.value.details[0].id).toBeTruthy();
    expect(component.flagsData[1].caseField.value.details[0].value).toBeTruthy();
    expect(component.flagsData[1].caseField.value.details[1].id).toBeTruthy();
    expect(component.flagsData[1].caseField.value.details[1].value).toBeTruthy();
    spyOn(component, 'determineLocationForFlag').and.callThrough();
    const populateNewFlagDetailInstanceSpy = spyOn(component, 'populateNewFlagDetailInstance').and.callThrough();
    const newFlag1 = {
      flags: null,
      pathToFlagsFormGroup: component.flagsData[0].pathToFlagsFormGroup,
      caseField: component.flagsData[0].caseField
    } as FlagsWithFormGroupPath;
    component.caseFlagParentFormGroup = new FormGroup({
      selectedLocation: new FormControl({...newFlag1})
    });
    component.addFlagToCollection();
    expect(component.determineLocationForFlag).toHaveBeenCalled();
    expect(populateNewFlagDetailInstanceSpy).toHaveBeenCalled();
    // Check there are now three case flag values in the caseField object for caseFlag1, and two in caseFlag2
    expect(component.flagsData[0].caseField.value.details.length).toBe(3);
    expect(component.flagsData[0].caseField.value.details[2].id).toBeUndefined();
    // FlagDetail value expected to be undefined because no caseFlagParentFormGroup value was set (which is used for
    // populating the FlagDetail instance)
    expect(component.flagsData[0].caseField.value.details[2].value.name).toBeUndefined();
    expect(component.flagsData[1].caseField.value.details.length).toBe(2);
    const newFlag2 = {
      flags: null,
      pathToFlagsFormGroup: component.flagsData[1].pathToFlagsFormGroup,
      caseField: component.flagsData[1].caseField
    } as FlagsWithFormGroupPath;
    component.caseFlagParentFormGroup = new FormGroup({
      selectedLocation: new FormControl({...newFlag2})
    });
    component.addFlagToCollection();
    // Check there are now two case flag values in the caseField object for caseFlag1, and three in caseFlag2
    expect(component.flagsData[0].caseField.value.details.length).toBe(2);
    expect(component.flagsData[1].caseField.value.details.length).toBe(3);
    expect(component.flagsData[1].caseField.value.details[2].id).toBeUndefined();
    // FlagDetail value expected to be undefined because no caseFlagParentFormGroup value was set (which is used for
    // populating the FlagDetail instance)
    expect(component.flagsData[1].caseField.value.details[2].value.name).toBeUndefined();
    component.caseFlagParentFormGroup = new FormGroup({
      selectedLocation: new FormControl(null)
    });
    populateNewFlagDetailInstanceSpy.calls.reset();
  });

  it('should add flag to collection when creating a flag for a CaseField whose value is null initially', () => {
    expect(component.flagsData[2].caseField.id).toEqual(caseFlagsFieldId);
    expect(component.flagsData[2].caseField.value).toBeNull();
    spyOn(component, 'determineLocationForFlag').and.callThrough();
    spyOn(component, 'populateNewFlagDetailInstance');
    const newFlag = {
      flags: null,
      pathToFlagsFormGroup: component.flagsData[2].pathToFlagsFormGroup,
      caseField: { ...component.flagsData[2].caseField }
    } as FlagsWithFormGroupPath;
    component.caseFlagParentFormGroup = new FormGroup({
      selectedLocation: new FormControl(newFlag)
    });
    component.addFlagToCollection();
    expect(component.determineLocationForFlag).toHaveBeenCalled();
    expect(component.populateNewFlagDetailInstance).toHaveBeenCalled();
    // Check that the caseFlags object has a value containing a details array, containing an object with a value property
    // of undefined
    expect(component.flagsData[2].caseField.value).toBeTruthy();
    expect(component.flagsData[2].caseField.value.details).toBeTruthy();
    expect(component.flagsData[2].caseField.value.details.length).toBe(1);
    expect(component.flagsData[2].caseField.value.details[0].value).toBeUndefined();
  });

  it('should not add flag to collection if the correct location for it cannot be determined', () => {
    spyOn(component, 'determineLocationForFlag').and.returnValue(undefined);
    spyOn(component, 'populateNewFlagDetailInstance');
    const newFlag = {
      flags: null,
      pathToFlagsFormGroup: component.flagsData[2].pathToFlagsFormGroup,
      caseField: { ...component.flagsData[2].caseField }
    } as FlagsWithFormGroupPath;
    component.caseFlagParentFormGroup = new FormGroup({
      selectedLocation: new FormControl(newFlag)
    });
    component.addFlagToCollection();
    expect(component.determineLocationForFlag).toHaveBeenCalled();
    expect(component.populateNewFlagDetailInstance).not.toHaveBeenCalled();
  });

  it('should populate a new FlagDetail instance correctly from the form values', () => {
    const flagStatusActiveKey = Object.keys(CaseFlagStatus).find(key => CaseFlagStatus[key] === 'Active');
    component.caseFlagParentFormGroup = new FormGroup({
      [CaseFlagFormFields.FLAG_TYPE]: new FormControl({
        name: 'Other',
        name_cy: 'Arall',
        flagCode: 'OT0001',
        Path: ['Part1', 'Part2', 'Part3'],
        hearingRelevant: false,
        externallyAvailable: true
      } as FlagType),
      languageSearchTerm: new FormControl({
        key: 'en',
        value: 'English',
        value_cy: 'Saesneg'
      }),
      otherDescription: new FormControl('English description'),
      flagComments: new FormControl('English comment'),
      statusReason: new FormControl('New flag'),
      selectedStatus: new FormControl(flagStatusActiveKey)
    });
    const flagDetail = component.populateNewFlagDetailInstance();
    expect(flagDetail.name).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].name);
    expect(flagDetail.name_cy).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].name_cy);
    expect(flagDetail.subTypeValue).toEqual(component.caseFlagParentFormGroup.value['languageSearchTerm'].value);
    expect(flagDetail.subTypeValue_cy).toBeNull();
    expect(flagDetail.subTypeKey).toEqual(component.caseFlagParentFormGroup.value['languageSearchTerm'].key);
    expect(flagDetail.otherDescription).toEqual(component.caseFlagParentFormGroup.value['otherDescription']);
    expect(flagDetail.otherDescription_cy).toBeNull();
    expect(flagDetail.flagComment).toEqual(component.caseFlagParentFormGroup.value['flagComments']);
    expect(flagDetail.flagComment_cy).toBeNull();
    expect(flagDetail.flagUpdateComment).toEqual(component.caseFlagParentFormGroup.value['statusReason']);
    expect(flagDetail.dateTimeCreated).toBeTruthy();
    expect(flagDetail.path).toEqual([
      {id: null, value: 'Part1'},
      {id: null, value: 'Part2'},
      {id: null, value: 'Part3'}
    ]);
    expect(flagDetail.hearingRelevant).toEqual('No');
    expect(flagDetail.flagCode).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].flagCode);
    expect(flagDetail.status).toEqual(CaseFlagStatus[component.caseFlagParentFormGroup.value['selectedStatus']]);
    expect(flagDetail.availableExternally).toEqual('Yes');
  });

  it('should populate a new FlagDetail instance correctly from the form values when selected language is Welsh', () => {
    rpxTranslationServiceSpy.language = 'cy';
    const flagStatusActiveKey = Object.keys(CaseFlagStatus).find(key => CaseFlagStatus[key] === 'Active');
    component.caseFlagParentFormGroup = new FormGroup({
      [CaseFlagFormFields.FLAG_TYPE]: new FormControl({
        name: 'Other',
        name_cy: 'Arall',
        flagCode: 'OT0001',
        Path: ['Part1', 'Part2', 'Part3'],
        hearingRelevant: true,
        externallyAvailable: false
      } as FlagType),
      manualLanguageEntry: new FormControl('Cymraeg'),
      otherDescription: new FormControl('Disgrifiad Cymraeg'),
      flagComments: new FormControl('Sylw Cymreig'),
      statusReason: new FormControl('New flag'),
      selectedStatus: new FormControl(flagStatusActiveKey)
    });
    let flagDetail = component.populateNewFlagDetailInstance();
    expect(flagDetail.name).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].name);
    expect(flagDetail.name_cy).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].name_cy);
    expect(flagDetail.subTypeValue).toBeNull();
    expect(flagDetail.subTypeValue_cy).toEqual(component.caseFlagParentFormGroup.value['manualLanguageEntry']);
    expect(flagDetail.subTypeKey).toBeNull();
    expect(flagDetail.otherDescription).toBeNull();
    expect(flagDetail.otherDescription_cy).toEqual(component.caseFlagParentFormGroup.value['otherDescription']);
    expect(flagDetail.flagComment).toBeNull();
    expect(flagDetail.flagComment_cy).toEqual(component.caseFlagParentFormGroup.value['flagComments']);
    expect(flagDetail.flagUpdateComment).toEqual(component.caseFlagParentFormGroup.value['statusReason']);
    expect(flagDetail.dateTimeCreated).toBeTruthy();
    expect(flagDetail.path).toEqual([
      {id: null, value: 'Part1'},
      {id: null, value: 'Part2'},
      {id: null, value: 'Part3'}
    ]);
    expect(flagDetail.hearingRelevant).toEqual('Yes');
    expect(flagDetail.flagCode).toEqual(component.caseFlagParentFormGroup.value[CaseFlagFormFields.FLAG_TYPE].flagCode);
    expect(flagDetail.status).toEqual(CaseFlagStatus[component.caseFlagParentFormGroup.value['selectedStatus']]);
    expect(flagDetail.availableExternally).toEqual('No');
    component.caseFlagParentFormGroup.addControl('languageSearchTerm', new FormControl({
      key: 'en',
      value: 'English',
      value_cy: 'Saesneg'
    }));
    flagDetail = component.populateNewFlagDetailInstance();
    expect(flagDetail.subTypeValue).toBeNull();
    expect(flagDetail.subTypeValue_cy).toEqual(component.caseFlagParentFormGroup.value['languageSearchTerm'].value_cy);
    expect(flagDetail.subTypeKey).toEqual(component.caseFlagParentFormGroup.value['languageSearchTerm'].key);
  });

  it('should update flag in collection when updating a case flag', () => {
    component.selectedFlag = selectedFlag;
    component.selectedFlag.caseField = component.flagsData[0].caseField;
    const flagStatusInactiveKey = Object.keys(CaseFlagStatus).find(key => CaseFlagStatus[key] === 'Inactive');
    component.caseFlagParentFormGroup = new FormGroup({
      [CaseFlagFormFields.OTHER_FLAG_DESCRIPTION]: new FormControl('A description'),
      [CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH]: new FormControl('A description (Welsh)'),
      [CaseFlagFormFields.COMMENTS]: new FormControl('An updated comment'),
      [CaseFlagFormFields.COMMENTS_WELSH]: new FormControl('An updated comment (Welsh)'),
      [CaseFlagFormFields.STATUS_CHANGE_REASON]: new FormControl('Status set to inactive'),
      [CaseFlagFormFields.STATUS]: new FormControl(flagStatusInactiveKey)
    });
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.updateFlagInCollection();
    // Check the description, comments, and status have been applied and the modified date/time has been set
    expect(component.flagsData[0].caseField.value.details[0].value.otherDescription).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.OTHER_FLAG_DESCRIPTION]);
    expect(component.flagsData[0].caseField.value.details[0].value.otherDescription_cy).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH]);
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.COMMENTS]);
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment_cy).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.COMMENTS_WELSH]);
    expect(component.flagsData[0].caseField.value.details[0].value.flagUpdateComment).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.STATUS_CHANGE_REASON]);
    expect(component.flagsData[0].caseField.value.details[0].value.status).toEqual(
      CaseFlagStatus[component.caseFlagParentFormGroup.value[CaseFlagFormFields.STATUS]]);
    expect(component.flagsData[0].caseField.value.details[0].value.dateTimeModified).toBeTruthy();
    // Check the original status has been cached
    expect(component.selectedFlag.originalStatus).toEqual('Active');
    // Check all other existing changes have been discarded (i.e. values restored from corresponding values in formatted_value)
    expect(component.flagsData[0].caseField.value.details[1].value.otherDescription).toEqual('Original description');
    expect(component.flagsData[0].caseField.value.details[1].value.otherDescription_cy).toEqual('Welsh description');
    expect(component.flagsData[0].caseField.value.details[1].value.flagComment).toEqual('Original new comment 1');
    expect(component.flagsData[0].caseField.value.details[1].value.flagComment_cy).toEqual('Welsh new comment 1');
    expect(component.flagsData[0].caseField.value.details[1].value.flagUpdateComment).toEqual('Status change 1');
    expect(component.flagsData[0].caseField.value.details[1].value.dateTimeModified).toEqual('2022-02-14T00:00:00.000');
    expect(component.flagsData[0].caseField.value.details[1].value.status).toEqual(CaseFlagStatus.ACTIVE);
    expect(component.flagsData[1].caseField.value.details[0].value.otherDescription).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.otherDescription_cy).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.flagComment).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.flagComment_cy).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.flagUpdateComment).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.dateTimeModified).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.status).toEqual(CaseFlagStatus.ACTIVE);
    expect(component.flagsData[1].caseField.value.details[1].value.otherDescription).toEqual('Another description');
    expect(component.flagsData[1].caseField.value.details[1].value.otherDescription_cy).toEqual('Cymraeg');
    expect(component.flagsData[1].caseField.value.details[1].value.flagComment).toEqual('Original new comment 2');
    expect(component.flagsData[1].caseField.value.details[1].value.flagComment_cy).toEqual('Welsh new comment 2');
    expect(component.flagsData[1].caseField.value.details[1].value.flagUpdateComment).toEqual('Status change 2');
    expect(component.flagsData[1].caseField.value.details[1].value.dateTimeModified).toEqual('2022-02-15T00:00:00.000');
    expect(component.flagsData[1].caseField.value.details[1].value.status).toEqual(CaseFlagStatus.ACTIVE);
  });

  it('should update flag comments correctly when updating a case flag with the language set to Welsh', () => {
    rpxTranslationServiceSpy.language = 'cy';
    component.selectedFlag = selectedFlag;
    component.selectedFlag.caseField = component.flagsData[0].caseField;
    component.caseFlagParentFormGroup = new FormGroup({
      [CaseFlagFormFields.COMMENTS]: new FormControl('An updated comment intended to be Welsh'),
    });
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.updateFlagInCollection();
    // Check the comments fields have the correct values
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment).toBeNull();
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment_cy).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.COMMENTS]);
  });

  it('should not update description fields when updating a case flag not of type "Other"', () => {
    component.selectedFlag = selectedFlag;
    component.selectedFlag.caseField = component.flagsData[0].caseField;
    // Deliberately change the flag code to non-"Other" code
    component.selectedFlag.flagDetailDisplay.flagDetail.flagCode = 'ABC';
    component.caseFlagParentFormGroup = new FormGroup({
      [CaseFlagFormFields.OTHER_FLAG_DESCRIPTION]: new FormControl('A description'),
      [CaseFlagFormFields.OTHER_FLAG_DESCRIPTION_WELSH]: new FormControl('A description (Welsh)'),
      [CaseFlagFormFields.COMMENTS]: new FormControl('An updated comment'),
      [CaseFlagFormFields.COMMENTS_WELSH]: new FormControl('An updated comment (Welsh)')
    });
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.updateFlagInCollection();
    // Check the description fields have not been updated but the comments have
    expect(component.flagsData[0].caseField.value.details[0].value.otherDescription).toBeNull();
    expect(component.flagsData[0].caseField.value.details[0].value.otherDescription_cy).toBeNull();
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.COMMENTS]);
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment_cy).toEqual(
      component.caseFlagParentFormGroup.value[CaseFlagFormFields.COMMENTS_WELSH]);
  });

  it('should handle the caseFlagStateEmitter and increment fieldState by 1 if not FLAG_COMMENTS or FLAG_UPDATE,' +
    'has no errors and listOfValues is empty', () => {
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl({
        listOfValues: []
      })
    });

    component.fieldState = 0;
    component.onCaseFlagStateEmitted({
        currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION,
        errorMessages: []
    });
    expect(component.fieldState).toEqual(1);

    component.fieldState = 0;
    component.onCaseFlagStateEmitted({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      errorMessages: []
    });
    expect(component.fieldState).toEqual(1);

    component.fieldState = 0;
    component.onCaseFlagStateEmitted({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: []
    });
    expect(component.fieldState).toEqual(1);
  });

  it('should move to the final review stage if no validation errors and current state is FLAG_STATUS (v2.1 enabled)', () => {
    component.isDisplayContextParameter2Point1Enabled = true;
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should move to the final review stage if no validation errors and current state is FLAG_COMMENTS (v2.1 not enabled)', () => {
    component.isDisplayContextParameter2Point1Enabled = false;
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_COMMENTS,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should move to the final review stage if no validation errors and current state is FLAG_UPDATE', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    // The Welsh translation checkbox is expected not to be selected
    expect(component.caseFlagParentFormGroup.get(CaseFlagFormFields.IS_WELSH_TRANSLATION_NEEDED)?.value).toBeFalsy();
    expect(component.moveToFinalReviewStage).toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should move to the final review stage if no validation errors and current state is FLAG_UPDATE_WELSH_TRANSLATION', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should proceed to next state if no validation errors, state not FLAG_STATUS or FLAG_UPDATE, and non-parent flag type', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).not.toHaveBeenCalled();
    expect(component.proceedToNextState).toHaveBeenCalled();
  });

  it('should not proceed to next state if the flag type is a parent', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: true,
      errorMessages: []
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).not.toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should not move to the final review stage if there is a validation error', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_STATUS,
      errorMessages: [
        {
          title: 'Error',
          description: 'An error occurred'
        }
      ]
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).not.toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should not proceed to next state if there is a validation error', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      errorMessages: [
        {
          title: 'Error',
          description: 'An error occurred'
        }
      ]
    };
    spyOn(component, 'moveToFinalReviewStage');
    spyOn(component, 'proceedToNextState');
    component.onCaseFlagStateEmitted(caseFlagState);
    expect(component.moveToFinalReviewStage).not.toHaveBeenCalled();
    expect(component.proceedToNextState).not.toHaveBeenCalled();
  });

  it('should skip the "language interpreter" state if the current state is FLAG_TYPE and there is no "list of values"', () => {
    component.fieldState = CaseFlagFieldState.FLAG_TYPE;
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_COMMENTS);
  });

  it('should move to the language interpreter step if selected Flag has listOfValues', () => {
    component.fieldState = CaseFlagFieldState.FLAG_TYPE;
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl({
        listOfValues: [
          {
            key: 'Abc',
            value: 'Value1'
          }
        ],
      })
    });
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_LANGUAGE_INTERPRETER);
  });

  it('should not move to the next state if already at the final state for the Create Case Flag journey (v2.1 enabled)', () => {
    component.isDisplayContextParameterUpdate = false;
    component.isDisplayContextParameter2Point1Enabled = true;
    component.fieldState = CaseFlagFieldState.FLAG_STATUS;
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_STATUS);
  });

  it('should not move to the next state if already at the final state for the Create Case Flag journey (v2.1 not enabled)', () => {
    component.isDisplayContextParameterUpdate = false;
    component.isDisplayContextParameter2Point1Enabled = false;
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_COMMENTS);
  });

  it('should not move to the next state if already at the final state for the Manage Case Flags journey', () => {
    component.isDisplayContextParameterUpdate = true;
    component.fieldState = CaseFlagFieldState.FLAG_UPDATE;
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_UPDATE);
  });

  it('should handle the flagCommentsOptionalEmitter', () => {
    component.onFlagCommentsOptionalEmitted('Dummy');
    expect(component.flagCommentsOptional).toBe(true);
  });

  it('should set the CaseField value for the Flags object at the end of the Create Case Flag journey (v2.1 enabled)', () => {
    spyOn(component, 'setFlagsCaseFieldValue').and.callThrough();
    spyOn(component, 'addFlagToCollection');
    spyOn(component, 'updateFlagInCollection');
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.fieldState = CaseFlagFieldState.FLAG_STATUS;
    component.moveToFinalReviewStage();
    expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
    expect(component.addFlagToCollection).toHaveBeenCalled();
    expect(component.updateFlagInCollection).not.toHaveBeenCalled();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should set the CaseField value for the Flags object at the end of the Create Case Flag journey (v2.1 not enabled)', () => {
    spyOn(component, 'setFlagsCaseFieldValue').and.callThrough();
    spyOn(component, 'addFlagToCollection');
    spyOn(component, 'updateFlagInCollection');
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.isDisplayContextParameterExternal = false;
    component.isDisplayContextParameter2Point1Enabled = false;
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    component.moveToFinalReviewStage();
    expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
    expect(component.addFlagToCollection).toHaveBeenCalled();
    expect(component.updateFlagInCollection).not.toHaveBeenCalled();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should set the CaseField value for the Flags object at the end of the Create Case Flag journey (external user)', () => {
    spyOn(component, 'setFlagsCaseFieldValue').and.callThrough();
    spyOn(component, 'addFlagToCollection');
    spyOn(component, 'updateFlagInCollection');
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.isDisplayContextParameterExternal = true;
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    component.moveToFinalReviewStage();
    expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
    expect(component.addFlagToCollection).toHaveBeenCalled();
    expect(component.updateFlagInCollection).not.toHaveBeenCalled();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should set the CaseField value for the Flags object at the end of the Manage Case Flags journey', () => {
    spyOn(component, 'setFlagsCaseFieldValue').and.callThrough();
    spyOn(component, 'addFlagToCollection');
    spyOn(component, 'updateFlagInCollection');
    spyOn(component.formGroup, 'updateValueAndValidity');
    component.fieldState = CaseFlagFieldState.FLAG_UPDATE;
    component.moveToFinalReviewStage();
    expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
    expect(component.addFlagToCollection).not.toHaveBeenCalled();
    expect(component.updateFlagInCollection).toHaveBeenCalled();
    expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
  });

  it('should populate a new FlagDetail instance with data held by the component, Case Flags v2.1 disabled', () => {
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl(null),
      languageSearchTerm: new FormControl(),
      manualLanguageEntry: new FormControl(),
      otherDescription: new FormControl(),
      flagComments: new FormControl(),
      statusReason: new FormControl(),
      selectedStatus: new FormControl()
    });

    const flagType = {
      name: 'Flag Name',
      name_cy: 'Enw Fflag (Cymraeg)',
      flagCode: 'OT0001',
      Path: ['Party'],
      hearingRelevant: true,
      externallyAvailable: false
    } as FlagType;

    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: {
          key: 'BSL',
          value: 'British Sign Language (BSL)',
          value_cy: 'Iaith Arwyddion Prydain (BSL)'
        },
        manualLanguageEntry: null,
        otherDescription: 'A flag type',
        flagComments: 'Some comments',
        // If Case Flags v2.1 is disabled, the flag status reason cannot be entered nor can the status be selected
        // (it will default to "Active")
        statusReason: null,
        selectedStatus: null
      }
    );

    const newFlagDetailInstance = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance.name).toBe(component.caseFlagParentFormGroup.value.flagType.name);
    expect(newFlagDetailInstance.name_cy).toBe(component.caseFlagParentFormGroup.value.flagType.name_cy);
    expect(newFlagDetailInstance.subTypeValue).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.value);
    expect(newFlagDetailInstance.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance.subTypeKey).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.key);
    expect(newFlagDetailInstance.otherDescription).toBe(component.caseFlagParentFormGroup.value.otherDescription);
    expect(newFlagDetailInstance.flagComment).toBe(component.caseFlagParentFormGroup.value.flagComments);
    expect(newFlagDetailInstance.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance.dateTimeCreated).toBeTruthy();
    expect(newFlagDetailInstance.path).toEqual([{
      id: null,
      value: component.caseFlagParentFormGroup.value.flagType.Path[0]
    }]);
    expect(newFlagDetailInstance.hearingRelevant).toBe('Yes');
    expect(newFlagDetailInstance.flagCode).toBe(component.caseFlagParentFormGroup.value.flagType.flagCode);
    expect(newFlagDetailInstance.status).toBe(CaseFlagStatus.ACTIVE);
    expect(newFlagDetailInstance.availableExternally).toBe('No');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType: {...flagType, hearingRelevant: false, externallyAvailable: true},
        languageSearchTerm: null,
        manualLanguageEntry: 'TypeScript',
        otherDescription: null,
        flagComments: null,
        // If Case Flags v2.1 is disabled, the flag status reason cannot be entered nor can the status be selected
        // (it will default to "Active")
        statusReason: null,
        selectedStatus: null
      }
    );
    const newFlagDetailInstance2 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance2.subTypeValue).toBe(component.caseFlagParentFormGroup.value.manualLanguageEntry);
    expect(newFlagDetailInstance2.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance2.subTypeKey).toBeNull();
    expect(newFlagDetailInstance2.otherDescription).toBeNull();
    expect(newFlagDetailInstance2.flagComment).toBeNull();
    expect(newFlagDetailInstance2.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance2.hearingRelevant).toBe('No');
    expect(newFlagDetailInstance2.status).toBe(CaseFlagStatus.ACTIVE);
    expect(newFlagDetailInstance2.availableExternally).toBe('Yes');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: null,
        manualLanguageEntry: null,
        otherDescription: null,
        flagComments: null,
        // If Case Flags v2.1 is disabled, the flag status reason cannot be entered nor can the status be selected
        // (it will default to "Active")
        statusReason: null,
        selectedStatus: null
      }
    );
    const newFlagDetailInstance3 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance3.subTypeValue).toBeNull();
    expect(newFlagDetailInstance3.subTypeValue_cy).toBeNull();
  });

  it('should populate a new FlagDetail instance with data held by the component, Case Flags v2.1 enabled', () => {
    component.isDisplayContextParameter2Point1Enabled = true;
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl(null),
      languageSearchTerm: new FormControl(),
      manualLanguageEntry: new FormControl(),
      otherDescription: new FormControl(),
      flagComments: new FormControl(),
      statusReason: new FormControl(),
      selectedStatus: new FormControl()
    });

    const flagType = {
      name: 'Flag Name',
      name_cy: 'Enw Fflag (Cymraeg)',
      flagCode: 'OT0001',
      Path: ['Party'],
      hearingRelevant: true,
      externallyAvailable: false
    } as FlagType;

    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: {
          key: 'BSL',
          value: 'British Sign Language (BSL)',
          value_cy: 'Iaith Arwyddion Prydain (BSL)'
        },
        manualLanguageEntry: null,
        otherDescription: 'A flag type',
        flagComments: 'Some comments',
        statusReason: 'A reason for the status',
        selectedStatus: 'REQUESTED'
      }
    );

    const newFlagDetailInstance = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance.name).toBe(component.caseFlagParentFormGroup.value.flagType.name);
    expect(newFlagDetailInstance.name_cy).toBe(component.caseFlagParentFormGroup.value.flagType.name_cy);
    expect(newFlagDetailInstance.subTypeValue).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.value);
    expect(newFlagDetailInstance.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance.subTypeKey).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.key);
    expect(newFlagDetailInstance.otherDescription).toBe(component.caseFlagParentFormGroup.value.otherDescription);
    expect(newFlagDetailInstance.flagComment).toBe(component.caseFlagParentFormGroup.value.flagComments);
    expect(newFlagDetailInstance.flagUpdateComment).toBe(component.caseFlagParentFormGroup.value.statusReason);
    expect(newFlagDetailInstance.dateTimeCreated).toBeTruthy();
    expect(newFlagDetailInstance.path).toEqual([{
      id: null,
      value: component.caseFlagParentFormGroup.value.flagType.Path[0]
    }]);
    expect(newFlagDetailInstance.hearingRelevant).toBe('Yes');
    expect(newFlagDetailInstance.flagCode).toBe(component.caseFlagParentFormGroup.value.flagType.flagCode);
    expect(newFlagDetailInstance.status).toBe(CaseFlagStatus[component.caseFlagParentFormGroup.value.selectedStatus]);
    expect(newFlagDetailInstance.availableExternally).toBe('No');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType: {...flagType, hearingRelevant: false, externallyAvailable: true},
        languageSearchTerm: null,
        manualLanguageEntry: 'TypeScript',
        otherDescription: null,
        flagComments: null,
        statusReason: null,
        selectedStatus: 'REQUESTED'
      }
    );
    const newFlagDetailInstance2 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance2.subTypeValue).toBe(component.caseFlagParentFormGroup.value.manualLanguageEntry);
    expect(newFlagDetailInstance2.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance2.subTypeKey).toBeNull();
    expect(newFlagDetailInstance2.otherDescription).toBeNull();
    expect(newFlagDetailInstance2.flagComment).toBeNull();
    expect(newFlagDetailInstance2.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance2.hearingRelevant).toBe('No');
    expect(newFlagDetailInstance2.status).toBe(CaseFlagStatus[component.caseFlagParentFormGroup.value.selectedStatus]);
    expect(newFlagDetailInstance2.availableExternally).toBe('Yes');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: null,
        manualLanguageEntry: null,
        otherDescription: null,
        flagComments: null,
        statusReason: null,
        selectedStatus: 'ACTIVE'
      }
    );
    const newFlagDetailInstance3 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance3.subTypeValue).toBeNull();
    expect(newFlagDetailInstance3.subTypeValue_cy).toBeNull();
  });

  it('should populate a new FlagDetail instance with data held by the component, for an external user', () => {
    component.isDisplayContextParameterExternal = true;
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl(null),
      languageSearchTerm: new FormControl(),
      manualLanguageEntry: new FormControl(),
      otherDescription: new FormControl(),
      flagComments: new FormControl(),
      statusReason: new FormControl(),
      selectedStatus: new FormControl()
    });

    const flagType = {
      name: 'Flag Name',
      name_cy: 'Enw Fflag (Cymraeg)',
      flagCode: 'OT0001',
      Path: ['Party'],
      hearingRelevant: true,
      defaultStatus: 'Requested',
      externallyAvailable: true
    } as FlagType;

    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: {
          key: 'BSL',
          value: 'British Sign Language (BSL)',
          value_cy: 'Iaith Arwyddion Prydain (BSL)'
        },
        manualLanguageEntry: null,
        otherDescription: 'A flag type',
        flagComments: 'Some comments',
        // If the user is external, the flag status reason cannot be entered nor can the status be selected (it will
        // be set to whatever default is specified in the flag type)
        statusReason: null,
        selectedStatus: null
      }
    );

    const newFlagDetailInstance = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance.name).toBe(component.caseFlagParentFormGroup.value.flagType.name);
    expect(newFlagDetailInstance.name_cy).toBe(component.caseFlagParentFormGroup.value.flagType.name_cy);
    expect(newFlagDetailInstance.subTypeValue).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.value);
    expect(newFlagDetailInstance.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance.subTypeKey).toBe(component.caseFlagParentFormGroup.value.languageSearchTerm.key);
    expect(newFlagDetailInstance.otherDescription).toBe(component.caseFlagParentFormGroup.value.otherDescription);
    expect(newFlagDetailInstance.flagComment).toBe(component.caseFlagParentFormGroup.value.flagComments);
    expect(newFlagDetailInstance.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance.dateTimeCreated).toBeTruthy();
    expect(newFlagDetailInstance.path).toEqual([{
      id: null,
      value: component.caseFlagParentFormGroup.value.flagType.Path[0]
    }]);
    expect(newFlagDetailInstance.hearingRelevant).toBe('Yes');
    expect(newFlagDetailInstance.flagCode).toBe(component.caseFlagParentFormGroup.value.flagType.flagCode);
    expect(newFlagDetailInstance.status).toBe(component.caseFlagParentFormGroup.value.flagType.defaultStatus);
    expect(newFlagDetailInstance.availableExternally).toBe('Yes');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType: {...flagType, hearingRelevant: false, defaultStatus: 'Active', externallyAvailable: true},
        languageSearchTerm: null,
        manualLanguageEntry: 'TypeScript',
        otherDescription: null,
        flagComments: null,
        // If the user is external, the flag status reason cannot be entered nor can the status be selected (it will
        // be set to whatever default is specified in the flag type)
        statusReason: null,
        selectedStatus: null
      }
    );
    const newFlagDetailInstance2 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance2.subTypeValue).toBe(component.caseFlagParentFormGroup.value.manualLanguageEntry);
    expect(newFlagDetailInstance2.subTypeValue_cy).toBeNull();
    expect(newFlagDetailInstance2.subTypeKey).toBeNull();
    expect(newFlagDetailInstance2.otherDescription).toBeNull();
    expect(newFlagDetailInstance2.flagComment).toBeNull();
    expect(newFlagDetailInstance2.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance2.hearingRelevant).toBe('No');
    expect(newFlagDetailInstance2.status).toBe(component.caseFlagParentFormGroup.value.flagType.defaultStatus);
    expect(newFlagDetailInstance2.availableExternally).toBe('Yes');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: null,
        manualLanguageEntry: null,
        otherDescription: null,
        flagComments: null,
        // If the user is external, the flag status reason cannot be entered nor can the status be selected (it will
        // be set to whatever default is specified in the flag type)
        statusReason: null,
        selectedStatus: null
      }
    );
    const newFlagDetailInstance3 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance3.subTypeValue).toBeNull();
    expect(newFlagDetailInstance3.subTypeValue_cy).toBeNull();
  });

  it('should call resetCache on caseFlagStateService only for specific field states and for undefined', () => {
    caseFlagStateServiceSpy.fieldStateToNavigate = undefined;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalled();

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_LOCATION;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalled();

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalled();
  });

  it('should not call resetCache on caseFlagStateService for other states', () => {
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_TYPE;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalledTimes(0);

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_COMMENTS;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalledTimes(0);

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_STATUS;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalledTimes(0);

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_UPDATE;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalledTimes(0);

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION;
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalledTimes(0);
  });

  it('should assign the form group from the case flag state service', () => {
    expect(component.caseFlagParentFormGroup).toBe(caseFlagStateServiceSpy.formGroup);
  });

  it('should set the proper location based off the location state\'s fieldState property', () => {
    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_LOCATION;
    component.ngOnInit();
    expect(component.fieldState).toEqual(CaseFlagFieldState.FLAG_LOCATION);

    caseFlagStateServiceSpy.fieldStateToNavigate = CaseFlagFieldState.FLAG_TYPE;
    component.ngOnInit();
    expect(component.fieldState).toEqual(CaseFlagFieldState.FLAG_TYPE);
  });

  it('should set selectedFlagsLocation on the Case Flag parent FormGroup', () => {
    component.caseFlagParentFormGroup = {
      value: {
        selectedLocation: {}
      }
    } as FormGroup;
    const selectedFlagsLocation = {
      caseField: {
        id: 'FlagsExternal',
        field_type: {
          id: 'Flags',
          type: 'Complex'
        } as FieldType
      } as CaseField,
      flags: {
        flagsCaseFieldId: 'FlagsExternal',
        partyName: 'Party 1',
        roleOnCase: 'Appellant',
        details: [],
        visibility: 'External',
        groupId: '4e07d5d2-ff70-4105-b46b-cd806321407c'
      } as Flags,
      pathToFlagsFormGroup: 'FlagsExternal'
    } as FlagsWithFormGroupPath;
    component.selectedFlagsLocation = selectedFlagsLocation;
    expect(component.caseFlagParentFormGroup.value.selectedLocation).toEqual(selectedFlagsLocation);
  });

  it('should return true for isAtFinalState() if in update mode and manageFlagFinalState is true', () => {
    const manageFlagFinalStateSpy = spyOnProperty(component, 'manageFlagFinalState', 'get').and.returnValue(
      CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION);
    component.isDisplayContextParameterUpdate = true;
    component.fieldState = CaseFlagFieldState.FLAG_UPDATE_WELSH_TRANSLATION;
    expect(component.isAtFinalState()).toBe(true);
    manageFlagFinalStateSpy.and.returnValue(CaseFlagFieldState.FLAG_UPDATE);
    component.fieldState = CaseFlagFieldState.FLAG_UPDATE;
    expect(component.isAtFinalState()).toBe(true);
  });

  it('should return true for isAtFinalState() if not in update mode, Case Flags v2.1 not enabled and at flag comments step', () => {
    component.isDisplayContextParameterUpdate = false;
    component.isDisplayContextParameter2Point1Enabled = false;
    component.fieldState = CaseFlagFieldState.FLAG_COMMENTS;
    expect(component.isAtFinalState()).toBe(true);
  });

  it('should return true for isAtFinalState() if not in update mode, Case Flags v2.1 enabled and at flag status step', () => {
    component.isDisplayContextParameterUpdate = false;
    component.isDisplayContextParameter2Point1Enabled = true;
    component.fieldState = CaseFlagFieldState.FLAG_STATUS;
    expect(component.isAtFinalState()).toBe(true);
  });

  describe('determineLocationForFlag() function tests', () => {
    const flagsData: FlagsWithFormGroupPath[] = [
      {
        flags: {
          flagsCaseFieldId: 'Party1FlagsInternal',
          partyName: 'Party 1',
          roleOnCase: 'Appellant',
          details: [],
          visibility: null,
          groupId: '2d7a939b-e2a3-4d2c-a8f2-abc3d5bb91bd'
        } as Flags,
        pathToFlagsFormGroup: 'Party1FlagsInternal',
        caseField: {
          id: 'Party1FlagsInternal',
          field_type: {
            id: 'Flags',
            type: 'Complex'
          } as FieldType,
          value: {
            details: [],
            groupId: '2d7a939b-e2a3-4d2c-a8f2-abc3d5bb91bd',
            partyName: 'Party 1',
            roleOnCase: 'Appellant',
            visibility: null
          }
        } as CaseField
      } as FlagsWithFormGroupPath,
      {
        flags: {
          flagsCaseFieldId: 'Party1FlagsExternal',
          partyName: 'Party 1',
          roleOnCase: 'Appellant',
          details: [],
          visibility: 'External',
          groupId: '2d7a939b-e2a3-4d2c-a8f2-abc3d5bb91bd'
        } as Flags,
        pathToFlagsFormGroup: 'Party1FlagsExternal',
        caseField: {
          id: 'Party1FlagsExternal',
          field_type: {
            id: 'Flags',
            type: 'Complex'
          } as FieldType,
          value: {
            details: [],
            groupId: '2d7a939b-e2a3-4d2c-a8f2-abc3d5bb91bd',
            partyName: 'Party 1',
            roleOnCase: 'Appellant',
            visibility: 'External'
          }
        } as CaseField
      } as FlagsWithFormGroupPath
    ];

    beforeEach(() => {
      component.flagsData = flagsData;
    });

    it('should determine the location when the new flag is of type "Other" and marked as visible internally only', () => {
      const formValues = {
        // Initial selected location is external
        selectedLocation: flagsData[1],
        flagType: {
          name: 'Other',
          externallyAvailable: true,
          flagCode: 'OT0001'
        },
        flagIsVisibleInternallyOnly: true
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be internal
      expect(determinedLocation).toEqual(flagsData[0]);
    });

    it('should determine the location when the new flag is of type "Other" and not marked as visible internally only', () => {
      const formValues = {
        // Initial selected location is external
        selectedLocation: flagsData[1],
        flagType: {
          name: 'Other',
          externallyAvailable: true,
          flagCode: 'OT0001'
        },
        flagIsVisibleInternallyOnly: ''
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be external (no change from initial selection)
      expect(determinedLocation).toEqual(flagsData[1]);
    });

    it('should determine the location when the new flag is not of type "Other" and is externally available', () => {
      const formValues = {
        // Initial selected location is internal
        selectedLocation: flagsData[0],
        flagType: {
          name: 'Sign Language Interpreter',
          externallyAvailable: true,
          flagCode: 'RA0042'
        },
        flagIsVisibleInternallyOnly: ''
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be external
      expect(determinedLocation).toEqual(flagsData[1]);
    });

    it('should determine the location when the new flag is not of type "Other" and is not externally available', () => {
      const formValues = {
        // Initial selected location is internal
        selectedLocation: flagsData[0],
        flagType: {
          name: 'Language Interpreter',
          externallyAvailable: false,
          flagCode: 'PF0015'
        },
        flagIsVisibleInternallyOnly: ''
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be internal (no change from initial selection)
      expect(determinedLocation).toEqual(flagsData[0]);
    });

    it('should return location undefined and set an error if no external flags collection has been defined', () => {
      // Deliberately make the external flags collection unavailable
      flagsData[1].flags.visibility = '';
      flagsData[1].caseField.value.visibility = '';
      const formValues = {
        // Initial selected location is internal
        selectedLocation: flagsData[0],
        flagType: {
          name: 'Sign Language Interpreter',
          externallyAvailable: true,
          flagCode: 'RA0042'
        },
        flagIsVisibleInternallyOnly: ''
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be undefined
      expect(determinedLocation).toBeUndefined();
      expect(component.errorMessages.length).toBe(1);
      expect(component.errorMessages[0]).toEqual({
        title: '',
        description: CaseFlagErrorMessage.NO_EXTERNAL_FLAGS_COLLECTION
      });
      expect(component.caseFlagParentFormGroup.errors).toEqual({
        noExternalCollection: true
      });
    });

    it('should return location undefined and set an error if no internal flags collection has been defined', () => {
      // Deliberately make the internal flags collection unavailable
      flagsData[0].flags.visibility = 'External';
      flagsData[0].caseField.value.visibility = 'External';
      // Restore the external flags collection visibility to ensure it's not treated as internal
      flagsData[1].flags.visibility = 'External';
      flagsData[1].caseField.value.visibility = 'External';
      const formValues = {
        // Initial selected location is external
        selectedLocation: flagsData[1],
        flagType: {
          name: 'Language Interpreter',
          externallyAvailable: false,
          flagCode: 'PF0015'
        },
        flagIsVisibleInternallyOnly: ''
      };
      const determinedLocation = component.determineLocationForFlag(true, formValues.selectedLocation, formValues);
      // Expected location should be undefined
      expect(determinedLocation).toBeUndefined();
      expect(component.errorMessages.length).toBe(1);
      expect(component.errorMessages[0]).toEqual({
        title: '',
        description: CaseFlagErrorMessage.NO_INTERNAL_FLAGS_COLLECTION
      });
      expect(component.caseFlagParentFormGroup.errors).toEqual({
        noInternalCollection: true
      });
    });

    it('should return the originally selected location if the user is external', () => {
      const determinedLocation = component.determineLocationForFlag(false, flagsData[1], null);
      expect(determinedLocation).toEqual(flagsData[1]);
    });

    it('should return the originally selected location if no groupId is present', () => {
      // Remove the groupId from one of the locations
      flagsData[0].flags.groupId = '';
      flagsData[0].caseField.value.groupId = '';
      const determinedLocation = component.determineLocationForFlag(true, flagsData[0], null);
      expect(determinedLocation).toEqual(flagsData[0]);
    });

    it('should not proceed to the point of submission if an error occurred determining the correct location', () => {
      spyOn(component, 'setFlagsCaseFieldValue');
      spyOn(component.formGroup, 'updateValueAndValidity');
      component.selectedFlagsLocation = null;
      // Simulate an error having occurred
      component.caseFlagParentFormGroup.setErrors({
        error: true
      });
      component.moveToFinalReviewStage();
      expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
      expect(component.formGroup.updateValueAndValidity).not.toHaveBeenCalled();
      expect(caseEditDataServiceSpy.setTriggerSubmitEvent).not.toHaveBeenCalled();
      // Selected flags location should remain un-updated
      expect(component.selectedFlagsLocation).toBeNull();
    });

    it('should proceed to the point of submission if no error occurred determining the correct location', () => {
      spyOn(component, 'setFlagsCaseFieldValue');
      spyOn(component.formGroup, 'updateValueAndValidity');
      component.selectedFlagsLocation = null;
      component.determinedLocation = flagsData[0];
      component.moveToFinalReviewStage();
      expect(component.setFlagsCaseFieldValue).toHaveBeenCalled();
      expect(component.formGroup.updateValueAndValidity).toHaveBeenCalled();
      expect(caseEditDataServiceSpy.setTriggerSubmitEvent).toHaveBeenCalledWith(true);
      // Selected flags location should be updated
      expect(component.selectedFlagsLocation).toEqual(flagsData[0]);
    });
  });
});
