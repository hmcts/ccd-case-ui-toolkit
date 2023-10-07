import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagCheckYourAnswersPageStep, CaseFlagDisplayContextParameter } from '../../enums';
import { CaseFlagSummaryListComponent } from './case-flag-summary-list.component';

describe('CaseFlagSummaryListComponent', () => {
  let component: CaseFlagSummaryListComponent;
  let fixture: ComponentFixture<CaseFlagSummaryListComponent>;
  let nativeElement: any;
  let mockRpxTranslationService: any;
  const updateFlagHeaderText = 'Update flag for';
  const addFlagHeaderText = 'Add flag to';

  const flagDetailDisplay = {
    partyName: 'Rose Bank',
    flagDetail: {
      name: 'Flag 1',
      flagComment: 'First flag',
      dateTimeCreated: new Date(),
      path: [{ id: '', value: 'Reasonable adjustment' }],
      hearingRelevant: false,
      flagCode: 'FL1',
      status: 'Active'
    } as FlagDetail
  } as FlagDetailDisplay;

  beforeEach(waitForAsync(() => {
    const source = new BehaviorSubject<RpxLanguage>('en');
    let currentLanguage: RpxLanguage = 'en';
    mockRpxTranslationService = {
      language$: source.asObservable(),
      set language(lang: RpxLanguage) {
        currentLanguage = lang;
        source.next(lang);
      },
      get language() {
        return currentLanguage;
      }
    };
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseFlagSummaryListComponent, MockRpxTranslatePipe ],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFlagSummaryListComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;
    // Set default translation language to English
    mockRpxTranslationService.language = 'en';
    // Deliberately omitted fixture.detectChanges() here because this will trigger the component's ngOnInit() before
    // the flagForSummaryDisplay input value has been set in each test, causing false failures
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the flag summary for a flag with comments, as part of the Create Case Flag journey', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flagDetailDisplay.partyName);
    expect(summaryListValues[1].textContent).toContain(flagDetailDisplay.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flagDetailDisplay.flagDetail.flagComment);
    expect(summaryListValues[3].textContent).toContain(flagDetailDisplay.flagDetail.status);
  });

  it('should display the flag summary for a flag without comments, as part of the Create Case Flag journey', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Flag 1',
        flagComment: '',
        dateTimeCreated: new Date(),
        path: [{ id: '', value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    // Flag comments section omitted if there are no comments, so next section is Status
    expect(summaryListValues[2].textContent).toContain(flagDetailDisplay.flagDetail.status);
  });

  it('should display the flag summary for the "Other" flag type with a description, as part of the Create Case Flag journey', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Other',
        otherDescription: 'A different flag',
        flagComment: 'First flag',
        dateTimeCreated: new Date(),
        path: [{ id: '', value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(`${flag.flagDetail.name} - ${flag.flagDetail.otherDescription}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
    expect(summaryListValues[3].textContent).toContain(flag.flagDetail.status);
  });

  it('should display the flag summary for a flag that has a sub-type value, as part of the Create Case Flag journey', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Sign Language Interpreter',
        subTypeValue: 'British Sign Language (BSL)',
        flagComment: 'First flag',
        dateTimeCreated: new Date(),
        path: [{ id: '', value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(`${flag.flagDetail.name} - ${flag.flagDetail.subTypeValue}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
    expect(summaryListValues[3].textContent).toContain(flag.flagDetail.status);
  });

  it('should display the flag summary for a flag with comments, as part of the Manage Case Flags journey', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(updateFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flagDetailDisplay.partyName);
    expect(summaryListValues[1].textContent).toContain(flagDetailDisplay.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flagDetailDisplay.flagDetail.flagComment);
    expect(summaryListValues[3].textContent).toContain(flagDetailDisplay.flagDetail.status);
  });

  it('should display summary details for Welsh', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Flag 1',
        flagComment: 'First flag',
        flagComment_cy: 'Flag comment for Welsh',
        dateTimeCreated: new Date(),
        path: [{ id: '', value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        otherDescription_cy: 'Other description for Welsh',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(updateFlagHeaderText);
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.otherDescription_cy);
    expect(summaryListValues[3].textContent).toContain(flag.flagDetail.flagComment);
    expect(summaryListValues[4].textContent).toContain(flag.flagDetail.flagComment_cy);
    expect(summaryListValues[5].textContent).toContain(flag.flagDetail.status);
  });

  it('should use the stored Welsh values for flag name and sub-type value if the selected language is Welsh', () => {
    mockRpxTranslationService.language = 'cy';
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Flag 1',
        name_cy: 'Flag 1 (Cymraeg)',
        dateTimeCreated: new Date(),
        path: [{ id: '', value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        otherDescription: 'Other description',
        otherDescription_cy: 'Other description for Welsh',
        subTypeValue_cy: 'Sub-type value (Cymraeg)',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    fixture.detectChanges();
    const summaryListValues = nativeElement.querySelectorAll('dd.govuk-summary-list__value');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    // The otherDescription field is expected to be shown verbatim because otherDescription for Welsh is shown separately
    expect(summaryListValues[1].textContent).toContain(
      `${flag.flagDetail.name_cy} - ${flag.flagDetail.otherDescription} - ${flag.flagDetail.subTypeValue_cy}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.otherDescription_cy);
  });

  it('should return correct flag type header text for "CREATE" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    expect(component.flagTypeHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT);
  });

  it('should return correct flag type header text for "CREATE EXTERNAL" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE_EXTERNAL;
    fixture.detectChanges();
    expect(component.flagTypeHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT_EXTERNAL);
  });

  it('should return correct flag type header text for "UPDATE" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    fixture.detectChanges();
    expect(component.flagTypeHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT);
  });

  it('should return correct flag type header text for "UPDATE EXTERNAL" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    fixture.detectChanges();
    expect(component.flagTypeHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.FLAG_TYPE_HEADER_TEXT_EXTERNAL);
  });

  it('should return correct flag type header text for empty display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = '';
    fixture.detectChanges();
    expect(component.flagTypeHeaderText).toEqual('');
  });

  it('should return correct add update flag header text for "CREATE" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE;
    fixture.detectChanges();
    expect(component.addUpdateFlagHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT);
  });

  it('should return correct add update flag header text for "CREATE EXTERNAL" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.CREATE_EXTERNAL;
    fixture.detectChanges();
    expect(component.addUpdateFlagHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.ADD_FLAG_HEADER_TEXT_EXTERNAL);
  });

  it('should return correct add update flag header text for "UPDATE" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE;
    fixture.detectChanges();
    expect(component.addUpdateFlagHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT);
  });

  it('should return correct add update flag header text for "UPDATE EXTERNAL" display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = CaseFlagDisplayContextParameter.UPDATE_EXTERNAL;
    fixture.detectChanges();
    expect(component.addUpdateFlagHeaderText).toEqual(CaseFlagCheckYourAnswersPageStep.UPDATE_FLAG_HEADER_TEXT_EXTERNAL);
  });

  it('should return correct add update flag header text for empty display context parameter', () => {
    component.flagForSummaryDisplay = flagDetailDisplay;
    component.displayContextParameter = '';
    fixture.detectChanges();
    expect(component.addUpdateFlagHeaderText).toEqual('');
  });
});
