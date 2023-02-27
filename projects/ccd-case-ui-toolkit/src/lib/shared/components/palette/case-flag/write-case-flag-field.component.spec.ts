import { Location } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseEditDataService } from '../../../commons/case-edit-data';
import { CaseField, FieldType } from '../../../domain/definition';
import { CaseFlagState, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from './domain';
import { CaseFlagFieldState, CaseFlagStatus, CaseFlagText } from './enums';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

import createSpy = jasmine.createSpy;
import { BehaviorSubject } from 'rxjs';
import { CaseFlagStateService } from '../../case-editor/services/case-flag-state.service';

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
    flagCode: 'WCA',
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
  // Set different comments, date/time modified, and status values in formatted_value to check they are restored
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.flagComment = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.flagComment = 'Original new comment 1';
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
  // Set different comments, date/time modified, and status values in formatted_value to check they are restored
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.flagComment = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.flagComment = 'Original new comment 2';
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

  const updateMode = '#ARGUMENT(UPDATE)';
  const updateExternalMode = '#ARGUMENT(UPDATE,EXTERNAL)';
  const createMode = '#ARGUMENT(CREATE)';
  const createExternalMode = '#ARGUMENT(CREATE,EXTERNAL)';

  let caseFlagStateServiceSpy: jasmine.SpyObj<CaseFlagStateService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let caseEditDataServiceSpy: jasmine.SpyObj<CaseEditDataService>;

  beforeEach(waitForAsync(() => {
    caseFlagStateServiceSpy = jasmine.createSpyObj('CaseFlagStateService', ['resetCache']);
    caseFlagStateServiceSpy.formGroup = new FormGroup({});

    locationSpy = jasmine.createSpyObj('Location', ['getState']);
    caseEditDataServiceSpy = jasmine.createSpyObj('CaseEditDataService', ['clearFormValidationErrors', 'setTriggerSubmitEvent']);
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
            ] as CaseField[]
          }
        }
      }
    };


    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ WriteCaseFlagFieldComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: CaseEditDataService, useValue: caseEditDataServiceSpy },
        { provide: Location, useValue: locationSpy },
        { provide: CaseFlagStateService, useValue: caseFlagStateServiceSpy },
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
    component.formGroup = parentFormGroup;
    component.caseField = flagLauncherCaseField;
    caseEditDataServiceSpy.caseTitle$ = new BehaviorSubject<string>('Mocked Case Title');
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have created a FormGroup with a validator, and set the correct Case Flag field starting state', () => {
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

  it('should set the correct Case Flag field starting state for the Manage Case Flags journey', () => {
    // Spy on setDisplayContextParameterUpdate() function and return true (cannot alter display_context_parameter for the
    // flagLauncherCaseField in case_fields of the mock route because this is locked down by compileComponents())
    component.setDisplayContextParameterUpdate = createSpy().and.returnValue(true);
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
    expect(component.populateNewFlagDetailInstance).toHaveBeenCalled();
    // Check that the caseFlags object has a value containing a details array, containing an object with a value property
    // of undefined
    expect(component.flagsData[2].caseField.value).toBeTruthy();
    expect(component.flagsData[2].caseField.value.details).toBeTruthy();
    expect(component.flagsData[2].caseField.value.details.length).toBe(1);
    expect(component.flagsData[2].caseField.value.details[0].value).toBeUndefined();
  });

  it('should update flag in collection when updating a case flag', () => {
    component.selectedFlag = selectedFlag;
    component.selectedFlag.caseField = component.flagsData[0].caseField;
    component.caseFlagParentFormGroup = new FormGroup({
      flagComments: new FormControl('An updated comment')
    });
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.updateFlagInCollection();
    // Check the comments have been applied and the modified date/time has been set
    expect(component.flagsData[0].caseField.value.details[0].value.flagComment).toEqual(
      component.caseFlagParentFormGroup.value.flagComments);
    expect(component.flagsData[0].caseField.value.details[0].value.dateTimeModified).toBeTruthy();
    // Check all other existing changes have been discarded (i.e. values restored from corresponding values in formatted_value)
    expect(component.flagsData[0].caseField.value.details[0].value.status).toEqual(CaseFlagStatus.ACTIVE);
    expect(component.flagsData[0].caseField.value.details[1].value.flagComment).toEqual('Original new comment 1');
    expect(component.flagsData[0].caseField.value.details[1].value.dateTimeModified).toEqual('2022-02-14T00:00:00.000');
    expect(component.flagsData[0].caseField.value.details[1].value.status).toEqual(CaseFlagStatus.ACTIVE);
    expect(component.flagsData[1].caseField.value.details[0].value.flagComment).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.dateTimeModified).toBeNull();
    expect(component.flagsData[1].caseField.value.details[0].value.status).toEqual(CaseFlagStatus.ACTIVE);
    expect(component.flagsData[1].caseField.value.details[1].value.flagComment).toEqual('Original new comment 2');
    expect(component.flagsData[1].caseField.value.details[1].value.dateTimeModified).toEqual('2022-02-15T00:00:00.000');
    expect(component.flagsData[1].caseField.value.details[1].value.status).toEqual(CaseFlagStatus.ACTIVE);
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

  it('should move to the final review stage if there are no validation errors and the current state is FLAG_STATUS', () => {
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

  it('should move to the final review stage if there are no validation errors and the current state is FLAG_UPDATE', () => {
    const caseFlagState: CaseFlagState = {
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_UPDATE,
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

  it('should not move to the next state if already at the final state for the Create Case Flag journey', () => {
    component.isDisplayContextParameterUpdate = false;
    component.fieldState = CaseFlagFieldState.FLAG_STATUS;
    component.proceedToNextState();
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_STATUS);
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

  it('should set the CaseField value for the Flags object at the end of the Create Case Flag journey', () => {
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

  it('should populate a new FlagDetail instance with data held by the component', () => {
    component.caseFlagParentFormGroup = new FormGroup({
      flagType: new FormControl(null),
      languageSearchTerm: new FormControl(),
      manualLanguageEntry: new FormControl(),
      otherFlagTypeDescription: new FormControl(),
      flagComments: new FormControl(),
      statusReason: new FormControl(),
      selectedStatus: new FormControl()
    });

    const flagType = {
      name: 'Flag Name',
      name_cy: 'Enw Fflag (Cymraeg)',
      flagCode: 'OT0001',
      path: [
        {
          id: '123',
          value: 'Reasonable adjustment'
        }
      ],
      hearingRelevantFlag: true,
      externallyAvailable: false
    };

    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: {
          key: 'BSL',
          value: 'British Sign Language'
        },
        manualLanguageEntry: null,
        otherFlagTypeDescription: 'A flag type',
        flagComments: 'Some comments',
        statusReason: 'A reason for the status',
        selectedStatus: 'ACTIVE'
      }
    );

    const newFlagDetailInstance = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance.name).toEqual(component.caseFlagParentFormGroup.value.flagType.name);
    expect(newFlagDetailInstance.name_cy).toEqual(component.caseFlagParentFormGroup.value.flagType.name_cy);
    expect(newFlagDetailInstance.subTypeValue).toEqual(component.caseFlagParentFormGroup.value.languageSearchTerm.value);
    expect(newFlagDetailInstance.subTypeKey).toEqual(component.caseFlagParentFormGroup.value.languageSearchTerm.key);
    expect(newFlagDetailInstance.otherDescription).toEqual(component.caseFlagParentFormGroup.value.otherFlagTypeDescription);
    expect(newFlagDetailInstance.flagComment).toEqual(component.caseFlagParentFormGroup.value.flagComments);
    expect(newFlagDetailInstance.flagUpdateComment).toEqual(component.caseFlagParentFormGroup.value.statusReason);
    expect(newFlagDetailInstance.dateTimeCreated).toBeTruthy();
    expect(newFlagDetailInstance.path).toEqual(component.caseFlagParentFormGroup.value.flagType.flagPath);
    expect(newFlagDetailInstance.hearingRelevant).toEqual('Yes');
    expect(newFlagDetailInstance.flagCode).toEqual(component.caseFlagParentFormGroup.value.flagType.flagCode);
    expect(newFlagDetailInstance.status).toBe(CaseFlagStatus.ACTIVE);
    expect(newFlagDetailInstance.availableExternally).toEqual('No');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType: {...flagType, hearingRelevantFlag: false, externallyAvailable: true},
        languageSearchTerm: null,
        manualLanguageEntry: 'TypeScript',
        otherFlagTypeDescription: null,
        flagComments: null,
        statusReason: null,
        selectedStatus: 'REQUESTED'
      }
    );
    const newFlagDetailInstance2 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance2.subTypeValue).toEqual(component.caseFlagParentFormGroup.value.manualLanguageEntry);
    expect(newFlagDetailInstance2.subTypeKey).toBeNull();
    expect(newFlagDetailInstance2.otherDescription).toBeNull();
    expect(newFlagDetailInstance2.flagComment).toBeNull();
    expect(newFlagDetailInstance2.flagUpdateComment).toBeNull();
    expect(newFlagDetailInstance2.hearingRelevant).toEqual('No');
    expect(newFlagDetailInstance2.status).toBe(CaseFlagStatus.REQUESTED);
    expect(newFlagDetailInstance2.availableExternally).toEqual('Yes');
    component.caseFlagParentFormGroup.setValue(
      {
        flagType,
        languageSearchTerm: null,
        manualLanguageEntry: null,
        otherFlagTypeDescription: null,
        flagComments: null,
        statusReason: null,
        selectedStatus: 'ACTIVE'
      }
    );
    const newFlagDetailInstance3 = component.populateNewFlagDetailInstance();
    expect(newFlagDetailInstance3.subTypeValue).toBeNull();
  });

  it('should call resetCache on caseFlagStateService when location.getState() returns undefined or below 0', () => {
    locationSpy.getState.and.returnValue(undefined);
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalled();

    locationSpy.getState.and.returnValue(-1);
    component.ngOnInit();
    expect(caseFlagStateServiceSpy.resetCache).toHaveBeenCalled();
  });

  it('should assign the form group from the case flag state service', () => {
    expect(component.caseFlagParentFormGroup).toBe(caseFlagStateServiceSpy.formGroup);
  });

  it('should set the proper location based off the location state\'s fieldState property', () => {
    locationSpy.getState.and.returnValue({fieldState: CaseFlagFieldState.FLAG_LOCATION});
    component.ngOnInit();
    expect(component.fieldState).toEqual(CaseFlagFieldState.FLAG_LOCATION);

    locationSpy.getState.and.returnValue({fieldState: CaseFlagFieldState.FLAG_TYPE});
    component.ngOnInit();
    expect(component.fieldState).toEqual(CaseFlagFieldState.FLAG_TYPE);
  });

  it('should set Create Case Flag component title caption text correctly', () => {
    expect(component.setCreateFlagCaption(createMode)).toEqual(CaseFlagText.CAPTION_INTERNAL);
    expect(component.setCreateFlagCaption(createExternalMode)).toEqual(CaseFlagText.CAPTION_EXTERNAL);
  });
});
