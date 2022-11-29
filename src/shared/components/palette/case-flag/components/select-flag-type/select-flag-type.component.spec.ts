import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { FlagType, HmctsServiceDetail } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService, RefdataCaseFlagType } from '../../../../../services/case-flag';
import { FlagPath } from '../../domain';
import { CaseFlagFieldState, SelectFlagTypeErrorMessage } from '../../enums';
import { SelectFlagTypeComponent } from './select-flag-type.component';

import createSpyObj = jasmine.createSpyObj;

describe('SelectFlagTypeComponent', () => {
  let component: SelectFlagTypeComponent;
  let fixture: ComponentFixture<SelectFlagTypeComponent>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  const flagTypes = [
    {
      name: 'Party',
      hearingRelevant: false,
      flagComment: false,
      flagCode: 'CATGRY',
      isParent: true,
      Path: [''],
      childFlags: [
        {
          name: 'Reasonable adjustment',
          hearingRelevant: false,
          flagComment: false,
          flagCode: 'CATGRY',
          isParent: true,
          Path: ['Party'],
          childFlags: [
            {
              name: 'I need help with forms',
              hearingRelevant: false,
              flagComment: false,
              flagCode: 'CATGRY',
              isParent: true,
              Path: ['Party', 'Reasonable adjustment'],
              childFlags: [
                {
                  name: 'Guidance on how to complete forms',
                  hearingRelevant: false,
                  flagComment: false,
                  flagCode: 'RA0017',
                  isParent: false,
                  Path: ['Party', 'Reasonable adjustment', 'I need help with forms'],
                  childFlags: []
                },
                {
                  name: 'Support filling in forms',
                  hearingRelevant: false,
                  flagComment: false,
                  flagCode: 'RA0018',
                  isParent: false,
                  Path: ['Party', 'Reasonable adjustment', 'I need help with forms'],
                  childFlags: []
                },
                {
                  name: 'Other',
                  hearingRelevant: true,
                  flagComment: true,
                  flagCode: 'OT0001',
                  isParent: false,
                  Path: ['Party', 'Reasonable adjustment', 'I need help with forms'],
                  childFlags: []
                }
              ]
            },
            {
              name: 'I need help communicating and understanding',
              hearingRelevant: false,
              flagComment: false,
              flagCode: 'CATGRY',
              childFlags: [
                {
                  name: 'Sign Language Interpreter',
                  hearingRelevant: true,
                  flagComment: false,
                  flagCode: 'RA0042',
                  listOfValuesLength: 3,
                  listOfValues: [
                    {
                      key: 'deafblindManualAlphabet',
                      value: 'Deafblind manual alphabet'
                    },
                    {
                      key: 'britishSignLanguage',
                      value: 'British Sign Language (BSL)'
                    },
                    {
                      key: 'americanSignLanguage',
                      value: 'American Sign Language (ASL)'
                    }
                  ],
                  isParent: false,
                  Path: [
                    'Party',
                    'Reasonable adjustment',
                    'I need help communicating and understanding'
                  ]
                },
                {
                  name: 'Other',
                  hearingRelevant: true,
                  flagComment: true,
                  flagCode: 'OT0001',
                  childFlags: [],
                  isParent: false,
                  Path: [
                    'Party',
                    'Reasonable adjustment',
                    'I need help communicating and understanding'
                  ]
                }
              ],
              isParent: true,
              Path: [
                'Party',
                'Reasonable adjustment'
              ]
            }
          ]
        },
        {
          name: 'Potentially suicidal',
          hearingRelevant: true,
          flagComment: false,
          flagCode: 'PF0003',
          isParent: false,
          Path: ['Party'],
          childFlags: []
        },
        {
          name: 'Other',
          hearingRelevant: true,
          flagComment: true,
          flagCode: 'OT0001',
          isParent: false,
          Path: ['Party'],
          childFlags: []
        }
      ]
    }
  ] as FlagType[];
  const serviceDetails = [
    {
      ccd_service_name: 'SSCS',
      org_unit: 'HMCTS',
      service_code: 'BBA3',
      service_id: 31
    }
  ] as HmctsServiceDetail[];
  const sscsJurisdiction = 'SSCS';

  beforeEach(async(() => {
    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>(
      'caseFlagRefdataService', ['getCaseFlagsRefdata', 'getHmctsServiceDetails']);
    caseFlagRefdataService.getCaseFlagsRefdata.and.returnValue(of(flagTypes));
    caseFlagRefdataService.getHmctsServiceDetails.and.returnValue(of(serviceDetails));
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectFlagTypeComponent],
      providers: [
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlagTypeComponent);
    component = fixture.componentInstance;
    component.formGroup = new FormGroup({
      'flagType': new FormControl(''),
      'otherFlagTypeDescription': new FormControl('')
    });
    component.jurisdiction = sscsJurisdiction;
    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set selected flag type if radio button selected for "Other"', () => {
    // Third radio button (with index 2) expected to be "Other" from test data
    const radioOtherElement = fixture.debugElement.nativeElement.querySelector('#flag-type-2');
    radioOtherElement.click();
    expect(component.selectedFlagType).toEqual(flagTypes[0].childFlags[2]);
    expect(component.otherFlagTypeSelected).toBe(true);
  });

  it('should set selected flag type if radio button selected but not for "Other"', () => {
    const radioElement = fixture.debugElement.nativeElement.querySelector('#flag-type-0');
    radioElement.click();
    expect(component.selectedFlagType).toEqual(flagTypes[0].childFlags[0]);
    expect(component.otherFlagTypeSelected).toBe(false);
  });

  it('should emit to parent if the validation succeeds and a parent flag type is selected', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // First radio button (with index 0) expected to be "Reasonable adjustment" from test data; flag type is a parent
    nativeElement.querySelector('#flag-type-0').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    const flagPaths: FlagPath[] = [];
    flagTypes[0].childFlags[0].Path.forEach(flagPath => {
      flagPaths.push({ id: null, value: flagPath })
    });
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: true,
      errorMessages: component.errorMessages,
      flagName: flagTypes[0].childFlags[0].name,
      flagPath: flagPaths,
      hearingRelevantFlag: flagTypes[0].childFlags[0].hearingRelevant,
      flagCode: flagTypes[0].childFlags[0].flagCode,
      listOfValues: null
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should emit to parent if the validation succeeds and a non-parent flag type is selected', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // Second radio button (with index 1) expected to be "Potentially suicidal" from test data; flag type is a non-parent
    nativeElement.querySelector('#flag-type-1').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    const flagPaths: FlagPath[] = [];
    flagTypes[0].childFlags[1].Path.forEach(flagPath => {
      flagPaths.push({ id: null, value: flagPath })
    });
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: false,
      errorMessages: component.errorMessages,
      flagName: flagTypes[0].childFlags[1].name,
      flagPath: flagPaths,
      hearingRelevantFlag: flagTypes[0].childFlags[1].hearingRelevant,
      flagCode: flagTypes[0].childFlags[1].flagCode,
      listOfValues: null
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should emit to parent with a list of values if a flag type that has a list of values is selected', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // First radio button (with index 0) expected to be "Reasonable adjustment" from test data; flag type is a parent
    nativeElement.querySelector('#flag-type-0').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    fixture.detectChanges();
    // Second radio button (with index 1) at next level expected to be "I need help communicating and understanding" from test data
    nativeElement.querySelector('#flag-type-1').click();
    nextButtonElement.click();
    fixture.detectChanges();
    // First radio button (with index 0) at next level expected to be "Sign Language Interpreter" from test data,
    // with list of values
    nativeElement.querySelector('#flag-type-0').click();
    nextButtonElement.click();
    const flagPaths: FlagPath[] = [];
    flagTypes[0].childFlags[0].childFlags[1].childFlags[0].Path.forEach(flagPath => {
      flagPaths.push({ id: null, value: flagPath })
    });
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: false,
      errorMessages: component.errorMessages,
      flagName: flagTypes[0].childFlags[0].childFlags[1].childFlags[0].name,
      flagPath: flagPaths,
      hearingRelevantFlag: flagTypes[0].childFlags[0].childFlags[1].childFlags[0].hearingRelevant,
      flagCode: flagTypes[0].childFlags[0].childFlags[1].childFlags[0].flagCode,
      listOfValues: flagTypes[0].childFlags[0].childFlags[1].childFlags[0].listOfValues
    });
    expect(component.errorMessages.length).toBe(0);
  });

  it('should emit "flag comments optional" event to parent if comments for the selected flag type are optional', () => {
    spyOn(component.flagCommentsOptionalEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // Second radio button (with index 1) expected to be "Potentially suicidal" from test data; comments optional for this flag type
    nativeElement.querySelector('#flag-type-1').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.flagCommentsOptionalEmitter.emit).toHaveBeenCalledWith(null);
  });

  it('should fail validation if no flag type is selected', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: null,
      errorMessages: component.errorMessages,
      flagName: null,
      flagPath: null,
      hearingRelevantFlag: null,
      flagCode: null,
      listOfValues: null
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const errorMessageElement = nativeElement.querySelector('#flag-type-not-selected-error-message');
    expect(errorMessageElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED);
  });

  it('should fail validation if "Other" flag type selected and description not entered', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
    fixture.detectChanges();
    const otherFlagTypeDescriptionElement: HTMLInputElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeTruthy();
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED);
  });

  it('should fail validation if "Other" flag type selected and description entered is more than 80 characters', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
    fixture.detectChanges();
    const otherFlagTypeDescriptionElement: HTMLInputElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherFlagTypeDescriptionElement).toBeTruthy();
    fixture.detectChanges();
    otherFlagTypeDescriptionElement.value = 'OtherFlagTypeDescriptionTestWithMoreThanEightyCharactersShouldFailTheValidationAsExpected';
    otherFlagTypeDescriptionElement.dispatchEvent(new Event('input'));
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_LIMIT_EXCEEDED);
  });

  it('should load the list of child flag types and reset current selection if selected flag type is a parent', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    // First radio button (with index 0) expected to be "Reasonable adjustment" from test data; flag type is a parent
    nativeElement.querySelector('#flag-type-0').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.flagTypes).toEqual(flagTypes[0].childFlags[0].childFlags);
    expect(component.formGroup.get(component.flagTypeControlName).value).toEqual('');
    expect(component.selectedFlagType).toBeNull();
  });

  it('should retrieve the list of flag types for the specified jurisdiction', () => {
    component.ngOnInit();
    expect(caseFlagRefdataService.getHmctsServiceDetails).toHaveBeenCalledWith(sscsJurisdiction);
    expect(caseFlagRefdataService.getCaseFlagsRefdata).toHaveBeenCalledWith(serviceDetails[0].service_code, RefdataCaseFlagType.PARTY);
    expect(component.flagTypes).toEqual(flagTypes[0].childFlags);
  });

  it('should set an error condition if an error occurs retrieving the list of flag types', () => {
    caseFlagRefdataService.getCaseFlagsRefdata.and.returnValue(throwError(new Error('Unable to retrieve flag data')));
    spyOn(component.caseFlagStateEmitter, 'emit');
    component.ngOnInit();
    expect(component.flagTypes).toEqual([]);
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: 'Unable to retrieve flag data',
      fieldId: 'conditional-radios-list'
    });
    expect(component.refdataError).toBe(true);
    expect(component.caseFlagStateEmitter.emit)
      .toHaveBeenCalledWith({ currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE, errorMessages: component.errorMessages });
    fixture.detectChanges();
    const nativeElement = fixture.debugElement.nativeElement;
    const nextButtonElement = nativeElement.querySelector('.button');
    // The "Next" button should not be present if an error has occurred when retrieving the list of flag types
    expect(nextButtonElement).toBeNull();
  });

  it('should unsubscribe from any Observables when the component is destroyed', () => {
    component.ngOnInit();
    spyOn(component.flagRefdata$, 'unsubscribe');
    expect(component.flagRefdata$).toBeTruthy();
    component.ngOnDestroy();
    expect(component.flagRefdata$.unsubscribe).toHaveBeenCalled();
  });
});
