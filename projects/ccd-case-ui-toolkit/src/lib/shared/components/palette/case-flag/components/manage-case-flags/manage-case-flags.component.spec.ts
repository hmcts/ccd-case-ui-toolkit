import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaseField } from '../../../../../domain';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, SelectFlagErrorMessage } from '../../enums';
import { ManageCaseFlagsComponent } from './manage-case-flags.component';

describe('ManageCaseFlagsComponent', () => {
  let component: ManageCaseFlagsComponent;
  let fixture: ComponentFixture<ManageCaseFlagsComponent>;
  const flagsData = [
    {
      flags: {
        partyName: 'Rose Bank',
        details: [
          {
            id: '1234',
            name: 'Flag 1',
            flagComment: 'First flag',
            dateTimeCreated: new Date(),
            path: [{ id: null, value: 'Reasonable adjustment' }],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Active'
          },
          {
            id: '2345',
            name: 'Flag 2',
            flagComment: 'Rose\'s second flag',
            dateTimeCreated: new Date(),
            path: [{ id: null, value: 'Reasonable adjustment' }],
            hearingRelevant: false,
            flagCode: 'FL2',
            status: 'Inactive'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag1'
      },
      pathToFlagsFormGroup: '',
      caseField: {
        id: 'CaseFlag1'
      } as CaseField
    },
    {
      flags: {
        partyName: 'Tom Atin',
        details: [
          {
            id: '3456',
            name: 'Flag 3',
            flagComment: 'First flag',
            dateTimeCreated: new Date(),
            path: [{ id: null, value: 'Reasonable adjustment' }],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Active'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag2'
      },
      pathToFlagsFormGroup: '',
      caseField: {
        id: 'CaseFlag2'
      } as CaseField
    },
    {
      flags: {
        partyName: '',
        details: [
          {
            id: '4567',
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
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3'
      } as CaseField
    },
    {
      flags: {
        partyName: '',
        details: [
          {
            id: '5678',
            name: 'Flag 5',
            flagComment: 'Fifth flag',
            dateTimeCreated: new Date(),
            path: [
              { id: null, value: 'Level 1' }
            ],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Active',
            subTypeKey: 'Dummy subtype key',
            subTypeValue: 'Dummy subtype value'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3'
      } as CaseField
    }
  ] as FlagsWithFormGroupPath[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ ManageCaseFlagsComponent ]
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

  it('should format the flag details (with comment) for display', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: 'Ann Peterson',
        flagDetail: {
          name: 'Language interpreter',
          flagComment: 'Claimant does not speak English',
          flagCode: '333'
        }
      },
      pathToFlagsFormGroup: ''
    } as FlagDetailDisplayWithFormGroupPath;
    const displayLabel = component.processLabel(flagDisplay);
    const flagDetail = flagDisplay.flagDetailDisplay.flagDetail;
    expect(displayLabel).toEqual(`${flagDisplay.flagDetailDisplay.partyName} - <span class="flag-name-and-description">${flagDetail.name}</span> (${flagDetail.flagComment})`);
  });

  it('should format the flag details (without comment) for display', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: 'Ann Peterson',
        flagDetail: {
          name: 'Language interpreter',
          flagCode: '333'
        }
      },
      pathToFlagsFormGroup: ''
    } as FlagDetailDisplayWithFormGroupPath;
    const displayLabel = component.processLabel(flagDisplay);
    expect(displayLabel).toEqual(`${flagDisplay.flagDetailDisplay.partyName} - <span class="flag-name-and-description">${flagDisplay.flagDetailDisplay.flagDetail.name}</span>`);
  });

  it('should format the flag details with child flags (with comment) for display', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: 'Ann Peterson',
        flagDetail: {
          name: 'Sign Language interpreter',
          flagCode: '333',
          path: [
            { id: null, value: 'party' },
            { id: null, value: 'Reasonable adjustment' },
            { id: null, value: 'I need help communicating and understanding' }
          ],
          flagComment: 'Test comment'
        }
      },
      pathToFlagsFormGroup: ''
    } as FlagDetailDisplayWithFormGroupPath;
    const displayLabel = component.processLabel(flagDisplay);
    const flagDetail = flagDisplay.flagDetailDisplay.flagDetail;
    expect(displayLabel).toEqual(
      `${flagDisplay.flagDetailDisplay.partyName} - <span class="flag-name-and-description">${flagDetail.path[1].value}, ${flagDetail.name}</span> (${flagDetail.flagComment})`);
  });

  it('should format the flag details with child flags (without comment) for display', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: 'Ann Peterson',
        flagDetail: {
          name: 'Sign Language interpreter',
          flagCode: '333',
          path: [
            { id: null, value: 'party' },
            { id: null, value: 'Reasonable adjustment' },
            { id: null, value: 'I need help communicating and understanding' }
          ]
        }
      },
      pathToFlagsFormGroup: ''
    } as FlagDetailDisplayWithFormGroupPath;
    const displayLabel = component.processLabel(flagDisplay);
    const flagDetail = flagDisplay.flagDetailDisplay.flagDetail;
    expect(displayLabel).toEqual(
      `${flagDisplay.flagDetailDisplay.partyName} - <span class="flag-name-and-description">${flagDetail.path[1].value}, ${flagDetail.name}</span>`);
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
    expect(displayResult.pathToFlagsFormGroup).toEqual(flagsInstance.flags.flagsCaseFieldId);
  });

  it('should map all parties and their flags to a single array for display purposes', () => {
    expect(component.flagsDisplayData).toBeTruthy();
    expect(component.flagsDisplayData.length).toBe(5);
    // Check correct mapping of the first party's flags
    expect(component.flagsDisplayData[0].flagDetailDisplay.partyName).toEqual(flagsData[0].flags.partyName);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.name).toEqual(flagsData[0].flags.details[0].name);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[0].flags.details[0].flagComment);
    expect(component.flagsDisplayData[0].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[0].flags.details[0].flagCode);
    expect(component.flagsDisplayData[1].flagDetailDisplay.partyName).toEqual(flagsData[0].flags.partyName);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.name).toEqual(flagsData[0].flags.details[1].name);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[0].flags.details[1].flagComment);
    expect(component.flagsDisplayData[1].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[0].flags.details[1].flagCode);
    // Check correct mapping of the second party's flags
    expect(component.flagsDisplayData[2].flagDetailDisplay.partyName).toEqual(flagsData[1].flags.partyName);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.name).toEqual(flagsData[1].flags.details[0].name);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.flagComment).toEqual(flagsData[1].flags.details[0].flagComment);
    expect(component.flagsDisplayData[2].flagDetailDisplay.flagDetail.flagCode).toEqual(flagsData[1].flags.details[0].flagCode);
  });

  it('should emit to parent with the selected party and flag details if the validation succeeds', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-selection-2').click();
    nativeElement.querySelector('.button').click();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: component.errorMessages,
      selectedFlag: {
        flagDetailDisplay: {
          partyName: flagsData[1].flags.partyName,
          flagDetail: flagsData[1].flags.details[0],
          flagsCaseFieldId: flagsData[1].flags.flagsCaseFieldId
        },
        pathToFlagsFormGroup: '',
        caseField: flagsData[1].caseField,
        roleOnCase: undefined,
        label: 'Tom Atin - <span class="flag-name-and-description">Flag 3</span> (First flag)'
      } as FlagDetailDisplayWithFormGroupPath
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should fail validation and emit to parent if no flag is selected', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    expect(component.flagsDisplayData.length).toBe(5);
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
      description: SelectFlagErrorMessage.FLAG_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const flagNotSelectedErrorMessageElement = nativeElement.querySelector('#manage-case-flag-not-selected-error-message');
    expect(flagNotSelectedErrorMessageElement.textContent).toContain(SelectFlagErrorMessage.FLAG_NOT_SELECTED);
  });

  it('should get correct party name', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: flagsData[2].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    expect(component.getPartyName(flagDisplay)).toEqual('Case level');
    flagDisplay.pathToFlagsFormGroup = null;
    expect(component.getPartyName(flagDisplay)).toEqual('');
  });

  it('should get correct flag name', () => {
    let flagDetail = flagsData[2].flags.details[0];
    expect(component.getFlagName(flagDetail)).toEqual('Level 2');
    flagDetail = flagsData[3].flags.details[0];
    expect(component.getFlagName(flagDetail)).toEqual('Dummy subtype value');
    flagDetail = flagsData[0].flags.details[0];
    expect(component.getFlagName(flagDetail)).toEqual('Flag 1');
  });

  it('should get party role on case', () => {
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[2].caseField,
      roleOnCase: 'Applicant'
    } as FlagDetailDisplayWithFormGroupPath;
    expect(component.getRoleOnCase(flagDisplay)).toEqual(' (Applicant)');
  });

  it('should get flag comment', () => {
    expect(component.getFlagComments(flagsData[3].flags.details[0])).toEqual(' (Fifth flag)');
  });
});
