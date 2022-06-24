import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlagDetail, FlagDetailDisplay, Flags } from '../../domain';
import { CaseFlagFieldState, SelectFlagErrorMessage } from '../../enums';
import { ManageCaseFlagsComponent } from './manage-case-flags.component';

describe('ManageCaseFlagsComponent', () => {
  let component: ManageCaseFlagsComponent;
  let fixture: ComponentFixture<ManageCaseFlagsComponent>;
  const flagsData = [
    {
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
    {
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
    }
  ] as Flags[];

  beforeEach(async(() => {
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
      partyName: 'Ann Peterson',
      flagDetail: {
        name: 'Language interpreter',
        flagComment: 'Claimant does not speak English',
        flagCode: '333'
      }
    } as FlagDetailDisplay;
    const displayLabel = component.processLabel(flagDisplay);
    expect(displayLabel).toEqual(`${flagDisplay.partyName} - ${flagDisplay.flagDetail.name} (${flagDisplay.flagDetail.flagComment})`);
  });

  it('should format the flag details (without comment) for display', () => {
    const flagDisplay = {
      partyName: 'Ann Peterson',
      flagDetail: {
        name: 'Language interpreter',
        flagCode: '333'
      }
    } as FlagDetailDisplay;
    const displayLabel = component.processLabel(flagDisplay);
    expect(displayLabel).toEqual(`${flagDisplay.partyName} - ${flagDisplay.flagDetail.name}`);
  });

  it('should format the flag details with child flags (with comment) for display', () => {
    const flagDisplay = {
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
    } as FlagDetailDisplay;
    const displayLabel = component.processLabel(flagDisplay);
    expect(displayLabel).toEqual(`${flagDisplay.partyName} - ${flagDisplay.flagDetail.path[1].value}, ${flagDisplay.flagDetail.name} (${flagDisplay.flagDetail.flagComment})`);
  });

  it('should format the flag details with child flags (without comment) for display', () => {
    const flagDisplay = {
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
    } as FlagDetailDisplay;
    const displayLabel = component.processLabel(flagDisplay);
    expect(displayLabel).toEqual(`${flagDisplay.partyName} - ${flagDisplay.flagDetail.path[1].value}, ${flagDisplay.flagDetail.name}`);
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
    const flagsCaseFieldId = 'CaseFlag2';
    const partyName = 'Wayne Sleep';
    const displayResult = component.mapFlagDetailForDisplay(flagDetail, partyName, flagsCaseFieldId);
    expect(displayResult.partyName).toEqual(partyName);
    expect(displayResult.flagDetail.name).toEqual(flagDetail.name);
    expect(displayResult.flagDetail.flagComment).toEqual(flagDetail.flagComment);
    expect(displayResult.flagDetail.flagCode).toEqual(flagDetail.flagCode);
  });

  it('should map all parties and their flags to a single array for display purposes', () => {
    expect(component.flagsDisplayData).toBeTruthy();
    expect(component.flagsDisplayData.length).toBe(3);
    // Check correct mapping of the first party's flags
    expect(component.flagsDisplayData[0].partyName).toEqual(flagsData[0].partyName);
    expect(component.flagsDisplayData[0].flagDetail.name).toEqual(flagsData[0].details[0].name);
    expect(component.flagsDisplayData[0].flagDetail.flagComment).toEqual(flagsData[0].details[0].flagComment);
    expect(component.flagsDisplayData[0].flagDetail.flagCode).toEqual(flagsData[0].details[0].flagCode);
    expect(component.flagsDisplayData[1].partyName).toEqual(flagsData[0].partyName);
    expect(component.flagsDisplayData[1].flagDetail.name).toEqual(flagsData[0].details[1].name);
    expect(component.flagsDisplayData[1].flagDetail.flagComment).toEqual(flagsData[0].details[1].flagComment);
    expect(component.flagsDisplayData[1].flagDetail.flagCode).toEqual(flagsData[0].details[1].flagCode);
    // Check correct mapping of the second party's flags
    expect(component.flagsDisplayData[2].partyName).toEqual(flagsData[1].partyName);
    expect(component.flagsDisplayData[2].flagDetail.name).toEqual(flagsData[1].details[0].name);
    expect(component.flagsDisplayData[2].flagDetail.flagComment).toEqual(flagsData[1].details[0].flagComment);
    expect(component.flagsDisplayData[2].flagDetail.flagCode).toEqual(flagsData[1].details[0].flagCode);
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
      selectedFlagDetail: flagsData[1].details[0],
      flagsCaseFieldId: flagsData[1].flagsCaseFieldId
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should fail validation and emit to parent if no flag is selected', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    expect(component.flagsDisplayData.length).toBe(3);
    expect(component.noFlagsError).toBe(false);
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_MANAGE_CASE_FLAGS,
      errorMessages: component.errorMessages,
      selectedFlagDetail: null,
      flagsCaseFieldId: null
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagErrorMessage.FLAG_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const flagNotSelectedErrorMessageElement = nativeElement.querySelector('#manage-case-flag-not-selected-error-message');
    expect(flagNotSelectedErrorMessageElement.textContent).toContain(SelectFlagErrorMessage.FLAG_NOT_SELECTED);
  });
});
