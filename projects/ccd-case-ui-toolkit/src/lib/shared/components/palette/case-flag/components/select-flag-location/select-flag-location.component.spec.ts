import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { FlagDetail, FlagsWithFormGroupPath } from '../../domain';
import { CaseFlagFieldState, CaseFlagWizardStepTitle, SelectFlagLocationErrorMessage } from '../../enums';
import { SelectFlagLocationComponent } from './select-flag-location.component';

describe('SelectFlagLocationComponent', () => {
  let component: SelectFlagLocationComponent;
  let fixture: ComponentFixture<SelectFlagLocationComponent>;
  let flagsData: FlagsWithFormGroupPath[];

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ SelectFlagLocationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlagLocationComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({});
    flagsData = [
      {
        flags: {
          flagsCaseFieldId: 'Party1Flags',
          partyName: 'Rose Bank',
          details: [
            {
              name: 'Flag 1',
              flagComment: 'First flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            },
            {
              name: 'Flag 2',
              flagComment: 'Rose\'s second flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL2',
              status: 'Inactive'
            }
          ] as FlagDetail[]
        },
        pathToFlagsFormGroup: ''
      },
      {
        flags: {
          flagsCaseFieldId: 'Party2Flags',
          partyName: 'Tom Atin',
          roleOnCase: 'Claimant',
          details: [
            {
              name: 'Flag 3',
              flagComment: 'First flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            }
          ] as FlagDetail[]
        },
        pathToFlagsFormGroup: ''
      },
      {
        flags: {
          flagsCaseFieldId: 'caseFlags',
          partyName: null,
          details: [
            {
              name: 'Flag 4',
              flagComment: 'Case-level flag',
              dateTimeCreated: new Date(),
              path: [{ id: null, value: 'Reasonable adjustment' }],
              hearingRelevant: false,
              flagCode: 'FL1',
              status: 'Active'
            }
          ] as FlagDetail[]
        },
        pathToFlagsFormGroup: 'caseFlags'
      }
    ] as FlagsWithFormGroupPath[];
    component.flagsData = flagsData;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set an error condition if the case has not been configured for flags', () => {
    component.flagsData = [];
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.ngOnInit();
    expect(component.filteredFlagsData).toEqual([]);
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagLocationErrorMessage.FLAGS_NOT_CONFIGURED,
      fieldId: 'conditional-radios-list'
    });
    expect(component.caseFlagsConfigError).toBe(true);
    expect(component.caseFlagStateEmitter.emit)
      .toHaveBeenCalledWith({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: component.errorMessages });
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const nextButtonElement = nativeElement.querySelector('.button');
    // The "Next" button should not be present if the error condition has been set
    expect(nextButtonElement).toBeNull();
  });

  it('should display a radio button for each party and one for case level', () => {
    expect(component.filteredFlagsData.length).toBe(3);
    const nativeElement = fixture.debugElement.nativeElement;
    const radioButtonElements = nativeElement.querySelectorAll('.govuk-radios__input');
    expect(radioButtonElements.length).toBe(3);
    // Cannot check a radio button input element's value directly (it is just "on"), so check it via the associated
    // FormControl when the button is clicked
    radioButtonElements[0].click();
    expect(component.formGroup.get(component.selectedLocationControlName).value).toEqual(flagsData[0]);
    radioButtonElements[1].click();
    expect(component.formGroup.get(component.selectedLocationControlName).value).toEqual(flagsData[1]);
    radioButtonElements[2].click();
    expect(component.formGroup.get(component.selectedLocationControlName).value).toEqual(flagsData[2]);
    const radioButtonLabelElements = nativeElement.querySelectorAll('.govuk-radios__label');
    expect(radioButtonLabelElements.length).toBe(3);
    expect(radioButtonLabelElements[0].textContent).toContain(flagsData[0].flags.partyName);
    expect(radioButtonLabelElements[1].textContent).toContain(flagsData[1].flags.partyName);
    expect(radioButtonLabelElements[1].textContent).toContain(`(${flagsData[1].flags.roleOnCase})`);
    expect(radioButtonLabelElements[2].textContent).toContain(component.caseLevelFlagLabel);
  });

  it('should emit to parent if the validation succeeds', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-location-0').click();
    nativeElement.querySelector('.button').click();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION,
      errorMessages: component.errorMessages,
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should fail validation and emit to parent if no flag location is selected', () => {
    spyOn(component, 'onNext').and.callThrough();
    spyOn(component.caseFlagStateEmitter, 'emit');
    expect(component.filteredFlagsData.length).toBe(3);
    expect(component.caseFlagsConfigError).toBe(false);
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    expect(component.onNext).toHaveBeenCalled();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_LOCATION,
      errorMessages: component.errorMessages,
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const flagNotSelectedErrorMessageElement = nativeElement.querySelector('#flag-location-not-selected-error-message');
    expect(flagNotSelectedErrorMessageElement.textContent).toContain(SelectFlagLocationErrorMessage.FLAG_LOCATION_NOT_SELECTED);
  });

  it('should set correct title', () => {
    expect(component.isDisplayContextParameterExternal).toEqual(false);
    expect(component.flagLocationTitle).toEqual(CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION);

    component.isDisplayContextParameterExternal = true;
    component.ngOnInit();
    expect(component.isDisplayContextParameterExternal).toEqual(true);
    expect(component.flagLocationTitle).toEqual(CaseFlagWizardStepTitle.SELECT_FLAG_LOCATION_EXTERNAL);
  });
});
