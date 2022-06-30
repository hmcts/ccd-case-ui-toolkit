import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CaseField, FieldType } from '../../../domain/definition';
import { FlagDetail, FlagDetailDisplay } from './domain';
import { CaseFlagFieldState, CaseFlagStatus } from './enums';
import { WriteCaseFlagFieldComponent } from './write-case-flag-field.component';

import createSpyObj = jasmine.createSpyObj;

describe('WriteCaseFlagFieldComponent', () => {
  let component: WriteCaseFlagFieldComponent;
  let fixture: ComponentFixture<WriteCaseFlagFieldComponent>;
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
    id: '1234234134214123',
    name: 'Wheelchair access',
    comment: 'A new comment for first party',
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
    id: '5678678578568567',
    name: 'Sign language',
    comment: 'Another new comment for first party',
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
    id: '0987987687657654',
    name: 'Foreign national offender',
    comment: 'A new comment for second party',
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
    id: '7890654385678342',
    name: 'Sign language',
    comment: 'Another new comment for second party',
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
  const mockRoute = {
    snapshot: {
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
              value: {}
            }
          ]
        }
      }
    }
  };
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
        },
        {
          // New value, hence the id is omitted (the test will check this value is removed)
          value: caseFlag1DetailsNewValue
        }
      ]
    },
  };
  // Set different comments, date/time modified, and status values in formatted_value to check they are restored
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.comment = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag1FieldId]['caseField'].formatted_value.details[1].value.comment = 'Original new comment 1';
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
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.comment = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[0].value.dateTimeModified = null;
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.comment = 'Original new comment 2';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.dateTimeModified =
    '2022-02-15T00:00:00.000';
  parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.status = CaseFlagStatus.ACTIVE;

  const flagDetail = {
    id: '1234234134214123',
    value: {
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
    } as FlagDetail
  };
  const selectedFlag = {
    partyName: caseFlag1PartyName,
    flagDetail: caseFlag1DetailsValue1,
    flagsCaseFieldId: caseFlag1FieldId
  } as FlagDetailDisplay;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ WriteCaseFlagFieldComponent ],
      providers: [
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WriteCaseFlagFieldComponent);
    component = fixture.componentInstance;
    component.caseEditPageComponent = createSpyObj('caseEditPageComponent', ['submit', 'getCaseTitle']);
    component.formGroup = parentFormGroup;
    component.caseField = flagLauncherCaseField;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should have called ngOnInit, created a FormGroup with a validator, and set the correct Case Flag field starting state', () => {
    expect(component.ngOnInit).toBeTruthy();
    expect(component.formGroup).toBeTruthy();
    expect(component.formGroup.validator).toBeTruthy();
    if (!component.isDisplayContextParameterUpdate) {
      expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_LOCATION);
    }
    // Initial validity of the form is expected to be false because it is at the starting state (only valid at the final state)
    expect(component.isAtFinalState()).toBe(false);
    expect(component.formGroup.valid).toBe(false);
    expect(component.formGroup.errors).not.toBeNull();
    expect(component.caseEditPageComponent.getCaseTitle).toHaveBeenCalled();
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
    // Field is expected to move to final state (flag comments) and the form to become valid
    expect(component.fieldState).toBe(CaseFlagFieldState.FLAG_COMMENTS);
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
    expect(component.flagsData[0].flagsCaseFieldId).toEqual(caseFlag1FieldId);
    expect(component.flagsData[0].partyName).toEqual(caseFlag1PartyName);
    expect(component.flagsData[0].roleOnCase).toEqual(caseFlag1RoleOnCase);
    expect(component.flagsData[0].details.length).toBe(2);
    expect(component.flagsData[0].details[0].name).toEqual(caseFlag1DetailsValue1.name);
    expect(component.flagsData[0].details[0].dateTimeModified).toEqual(null);
    expect(component.flagsData[0].details[0].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[0].details[0].hearingRelevant).toBe(false);
    expect(component.flagsData[1].flagsCaseFieldId).toEqual(caseFlag2FieldId);
    expect(component.flagsData[1].partyName).toEqual(caseFlag2PartyName);
    expect(component.flagsData[1].roleOnCase).toEqual(caseFlag2RoleOnCase);
    expect(component.flagsData[1].details.length).toBe(2);
    expect(component.flagsData[1].details[1].name).toEqual(caseFlag2DetailsValue2.name);
    expect(component.flagsData[1].details[1].dateTimeModified).toEqual(new Date(
      parentFormGroup.controls[caseFlag2FieldId]['caseField'].formatted_value.details[1].value.dateTimeModified));
    expect(component.flagsData[1].details[1].dateTimeCreated).toEqual(new Date(caseFlag1DetailsValue1.dateTimeCreated));
    expect(component.flagsData[1].details[1].hearingRelevant).toBe(true);
    expect(component.flagsData[2].flagsCaseFieldId).toEqual(caseFlagsFieldId);
    expect(component.flagsData[2].partyName).toBeUndefined();
    expect(component.flagsData[2].roleOnCase).toBeUndefined();
    expect(component.flagsData[2].details).toBeNull();
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
    // Check there are three case flag values in the caseField object for caseFlag1 and caseFlag2 - two with an id,
    // one without
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details.length).toBe(3);
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[2].id).toBeUndefined();
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[2].value).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details.length).toBe(3);
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[2].id).toBeUndefined();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[2].value).toBeTruthy();
    spyOn(component, 'populateNewFlagDetailInstance');
    const caseField = {
      value: {
        flagComments: 'test comment',
        details: [flagDetail]
      }
    };
    component.caseFlagParentFormGroup = new FormGroup({});
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.caseFlagParentFormGroup['caseField'] = caseField;
    component.addFlagToCollection();
    expect(component.populateNewFlagDetailInstance).toHaveBeenCalled();
    // Check there are now two case flag values in the caseField object for caseFlag1 and caseFlag2 - all with an id
    // (the ones without should have been removed, as they are previous "new" case flag values)
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details.length).toBe(2);
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[0].id).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[0].value).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[1].id).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[1].value).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details.length).toBe(2);
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[0].id).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[0].value).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[1].id).toBeTruthy();
    expect(parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[1].value).toBeTruthy();
  });

  it('should update flag in collection when updating a case flag', () => {
    component.selectedFlag = selectedFlag;
    const caseField = {
      value: {
        flagComments: 'test comment',
        details: [flagDetail]
      }
    };
    component.caseFlagParentFormGroup = new FormGroup({
      flagComments: new FormControl('An updated comment')
    });
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.caseFlagParentFormGroup['caseField'] = caseField;
    component.caseFlagParentFormGroup.setParent(parentFormGroup);
    component.updateFlagInCollection();
    // Check the comments have been applied
    expect(caseField.value.details[0].value.flagComment).toEqual(component.caseFlagParentFormGroup.value.flagComments);
    // Check all other existing changes have been discarded (i.e. values restored from corresponding values in formatted_value)
    parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[0].value.comment = null;
    parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[0].value.dateTimeModified = null;
    parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[1].value.comment = 'Original new comment 1';
    parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[1].value.dateTimeModified =
      '2022-02-14T00:00:00.000';
    parentFormGroup.controls[caseFlag1FieldId]['caseField'].value.details[1].value.status = CaseFlagStatus.ACTIVE;
    parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[0].value.comment = null;
    parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[0].value.dateTimeModified = null;
    parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[1].value.comment = 'Original new comment 2';
    parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[1].value.dateTimeModified =
      '2022-02-15T00:00:00.000';
    parentFormGroup.controls[caseFlag2FieldId]['caseField'].value.details[1].value.status = CaseFlagStatus.ACTIVE;
  });
});
