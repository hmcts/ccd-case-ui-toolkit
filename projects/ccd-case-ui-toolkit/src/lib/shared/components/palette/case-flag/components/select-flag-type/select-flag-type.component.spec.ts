import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { FlagType, HmctsServiceDetail } from '../../../../../domain/case-flag';
import { CaseFlagRefdataService, RefdataCaseFlagType } from '../../../../../services/case-flag';
import { CaseFlagFieldState, CaseFlagFormFields, SelectFlagTypeErrorMessage } from '../../enums';
import { SelectFlagTypeComponent } from './select-flag-type.component';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';

import createSpyObj = jasmine.createSpyObj;
import { SearchLanguageInterpreterControlNames } from '../search-language-interpreter/search-language-interpreter-control-names.enum';

describe('SelectFlagTypeComponent', () => {
  let component: SelectFlagTypeComponent;
  let fixture: ComponentFixture<SelectFlagTypeComponent>;
  let caseFlagRefdataService: jasmine.SpyObj<CaseFlagRefdataService>;
  let flagTypes: FlagType[];

  const serviceDetails = [
    {
      ccd_service_name: 'SSCS',
      org_unit: 'HMCTS',
      service_code: 'BBA3',
      service_id: 31
    }
  ] as HmctsServiceDetail[];
  const sscsJurisdiction = 'SSCS';
  const caseTypeId = 'testCaseType';

  beforeEach(waitForAsync(() => {
    flagTypes = [
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

    caseFlagRefdataService = createSpyObj<CaseFlagRefdataService>('caseFlagRefdataService',
      ['getCaseFlagsRefdata', 'getHmctsServiceDetailsByServiceName', 'getHmctsServiceDetailsByCaseType']);
    caseFlagRefdataService.getCaseFlagsRefdata.and.returnValue(of(flagTypes));
    caseFlagRefdataService.getHmctsServiceDetailsByServiceName.and.returnValue(of(serviceDetails));
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(of(serviceDetails));
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [SelectFlagTypeComponent, MockRpxTranslatePipe],
      providers: [
        { provide: CaseFlagRefdataService, useValue: caseFlagRefdataService },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectFlagTypeComponent);
    component = fixture.componentInstance;
    component.jurisdiction = sscsJurisdiction;
    component.caseTypeId = caseTypeId;
    component.formGroup = new FormGroup({});
    component.isDisplayContextParameterExternal = false;
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
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: true,
      errorMessages: component.errorMessages,
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
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: false,
      errorMessages: component.errorMessages,
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
    expect(component.caseFlagStateEmitter.emit).toHaveBeenCalledWith({
      currentCaseFlagFieldState: CaseFlagFieldState.FLAG_TYPE,
      isParentFlagType: false,
      errorMessages: component.errorMessages,
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

  it('should not emit "flag comments optional" event to parent if an intermediate (non-child) flag type is selected', () => {
    spyOn(component.flagCommentsOptionalEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // First radio button (with index 0) expected to be "Reasonable adjustment" from test data; flag type is a parent
    nativeElement.querySelector('#flag-type-0').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.flagCommentsOptionalEmitter.emit).not.toHaveBeenCalled();
  });

  it('should not emit "flag comments optional" event to parent if comments for the selected flag type are mandatory', () => {
    spyOn(component.flagCommentsOptionalEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    // Third radio button (with index 2) expected to be "Other" from test data; comments mandatory for this flag type
    nativeElement.querySelector('#flag-type-2').click();
    const nextButtonElement = nativeElement.querySelector('.button');
    nextButtonElement.click();
    expect(component.flagCommentsOptionalEmitter.emit).not.toHaveBeenCalled();
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
    });
    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const errorMessageElement = nativeElement.querySelector('#flag-type-not-selected-error-message');
    expect(errorMessageElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_SELECTED);
  });

  it('should fail if a flag type with children is selected and then no option is selected on next screen', () => {
    spyOn(component.caseFlagStateEmitter, 'emit');
    const nativeElement = fixture.debugElement.nativeElement;
    component.formGroup.get(CaseFlagFormFields.FLAG_TYPE).setValue(flagTypes[0].childFlags[0]);
    // Need twice - one for first selection which should pass validation and the second will fail
    nativeElement.querySelector('.button').click();
    expect(component.errorMessages).toEqual([]);
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();

    expect(component.errorMessages[0]).toEqual({
      title: '',
      description: SelectFlagTypeErrorMessage.FLAG_TYPE_OPTION_NOT_SELECTED,
      fieldId: 'conditional-radios-list'
    });
    const errorMessageElement = nativeElement.querySelector('#flag-type-not-selected-error-message');
    expect(errorMessageElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_OPTION_NOT_SELECTED);
  });

  it('should fail validation if "Other" flag type selected and description not entered', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
    fixture.detectChanges();
    const otherDescription: HTMLInputElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherDescription).toBeTruthy();
    nativeElement.querySelector('.button').click();
    fixture.detectChanges();
    const errorSummaryElement = nativeElement.querySelector('#flag-type-error-message');
    expect(errorSummaryElement.textContent).toContain(SelectFlagTypeErrorMessage.FLAG_TYPE_NOT_ENTERED);
  });

  it('should fail validation if "Other" flag type selected and description entered is more than 80 characters', () => {
    const nativeElement = fixture.debugElement.nativeElement;
    nativeElement.querySelector('#flag-type-2').click();
    fixture.detectChanges();
    const otherDescription: HTMLInputElement = nativeElement.querySelector('#other-flag-type-description');
    expect(otherDescription).toBeTruthy();
    fixture.detectChanges();
    otherDescription.value = 'OtherFlagTypeDescriptionTestWithMoreThanEightyCharactersShouldFailTheValidationAsExpected';
    otherDescription.dispatchEvent(new Event('input'));
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
    expect(component.formGroup.get(CaseFlagFormFields.FLAG_TYPE).value).toEqual(null);
    expect(component.selectedFlagType).toBeNull();
  });

  it('should retrieve the list of flag types for the specified HMCTS Service ID', () => {
    // Need to reset caseFlagRefdataService spy object method call because component.hmctsServiceId is undefined on the
    // first call of ngOnInit() triggered by fixture.detectChanges() - this means getHmctsServiceDetailsByCaseType() gets
    // called even though it's not expected to be
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.calls.reset();
    caseFlagRefdataService.getCaseFlagsRefdata.calls.reset();
    component.hmctsServiceId = 'ABC1';
    component.ngOnInit();
    expect(caseFlagRefdataService.getCaseFlagsRefdata).toHaveBeenCalledWith('ABC1', RefdataCaseFlagType.PARTY, false,
      component.isDisplayContextParameterExternal);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).not.toHaveBeenCalled();
    expect(component.flagTypes).toEqual(flagTypes[0].childFlags);
  });

  it('should retrieve the list of flag types for the specified case type ID', () => {
    caseFlagRefdataService.getCaseFlagsRefdata.calls.reset();
    component.ngOnInit();
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith(caseTypeId);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByServiceName).not.toHaveBeenCalled();
    expect(caseFlagRefdataService.getCaseFlagsRefdata).toHaveBeenCalledWith(serviceDetails[0].service_code,
      RefdataCaseFlagType.PARTY, false, component.isDisplayContextParameterExternal);
    expect(component.flagTypes).toEqual(flagTypes[0].childFlags);
  });

  it('should retrieve the list of flag types for the specified jurisdiction if lookup by case type ID failed', () => {
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.calls.reset();
    caseFlagRefdataService.getCaseFlagsRefdata.calls.reset();
    caseFlagRefdataService.getHmctsServiceDetailsByCaseType.and.returnValue(throwError(new Error('Unknown case type ID')));
    component.ngOnInit();
    expect(caseFlagRefdataService.getHmctsServiceDetailsByCaseType).toHaveBeenCalledWith(caseTypeId);
    expect(caseFlagRefdataService.getHmctsServiceDetailsByServiceName).toHaveBeenCalledWith(sscsJurisdiction);
    expect(caseFlagRefdataService.getCaseFlagsRefdata).toHaveBeenCalledWith(serviceDetails[0].service_code,
      RefdataCaseFlagType.PARTY, false, component.isDisplayContextParameterExternal);
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
    spyOn(component.flagTypeControlChangesSubscription, 'unsubscribe');
    component.ngOnDestroy();
    expect(component.flagRefdata$.unsubscribe).toHaveBeenCalled();
    expect(component.flagTypeControlChangesSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should subscribe to the valueChanges of flagTypeControlName control' +
    'and on new value it should clear descriptionControl value,' +
    'clear languageSearchTerm, clear manualLanguageEntry and empty cachedPath', () => {
    component.formGroup = new FormGroup({
      [CaseFlagFormFields.FLAG_TYPE]: new FormControl(''),
      [CaseFlagFormFields.OTHER_FLAG_DESCRIPTION]: new FormControl(''),
      [SearchLanguageInterpreterControlNames.LANGUAGE_SEARCH_TERM] : new FormControl('test1'),
      [SearchLanguageInterpreterControlNames.MANUAL_LANGUAGE_ENTRY] : new FormControl('test2')
    });

    component.cachedPath = [flagTypes[0], flagTypes[0][1]];
    component.ngOnInit();
    component.formGroup.get(CaseFlagFormFields.FLAG_TYPE).setValue('testValue');

    expect(component.formGroup.get(CaseFlagFormFields.OTHER_FLAG_DESCRIPTION).value).toEqual('');
    expect(component.cachedPath.length).toEqual(0);
    expect(component.formGroup.get('languageSearchTerm').value).toEqual('');
    expect(component.formGroup.get('manualLanguageEntry').value).toEqual('');
  });

  it('should assign name of selected flag type from the formControl' +
    'to selectionTitles property on every onNext() call' +
    'and it should display it ', () => {
    const flagTypeformControl = component.formGroup.get(CaseFlagFormFields.FLAG_TYPE);
    const flagTypeHeadingEl = fixture.debugElement.query(By.css('#flag-type-heading'));

    expect(component.selectionTitle).toEqual('');
    flagTypeformControl.setValue(flagTypes[0].childFlags[0]);
    component.onNext();
    const title1 = 'Reasonable adjustment';
    expect(component.selectionTitle).toEqual(title1);
    fixture.detectChanges();
    expect(flagTypeHeadingEl.nativeElement.textContent.trim()).toEqual(title1);

    flagTypeformControl.setValue(flagTypes[0].childFlags[0].childFlags[0]);
    component.onNext();
    const title2 = 'I need help with forms';
    expect(component.selectionTitle).toEqual(title2);
    fixture.detectChanges();
    expect(flagTypeHeadingEl.nativeElement.textContent.trim()).toEqual(title2);
  });
});
