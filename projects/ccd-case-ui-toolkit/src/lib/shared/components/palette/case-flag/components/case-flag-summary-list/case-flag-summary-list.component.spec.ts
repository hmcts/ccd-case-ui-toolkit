import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagCheckYourAnswersPageStep, CaseFlagDisplayContextParameter } from '../../enums';
import { CaseFlagSummaryListComponent } from './case-flag-summary-list.component';

describe('CaseFlagSummaryListComponent', () => {
  let component: CaseFlagSummaryListComponent;
  let fixture: ComponentFixture<CaseFlagSummaryListComponent>;
  let nativeElement: any;
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
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseFlagSummaryListComponent, MockRpxTranslatePipe ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFlagSummaryListComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.debugElement.nativeElement;
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
    // Flag status is not expected to be displayed if the summary page is shown during the Create Case Flag journey
    expect(summaryListValues[3]).toBeUndefined();
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
    // Flag comments is not displayed if there is no comments
    expect(summaryListValues[2]).toBeUndefined();
    // Flag status is not expected to be displayed if the summary page is shown during the Create Case Flag journey
    expect(summaryListValues[3]).toBeUndefined();
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
    // Flag status is not expected to be displayed if the summary page is shown during the Create Case Flag journey
    expect(summaryListValues[3]).toBeUndefined();
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
    // Flag status is not expected to be displayed if the summary page is shown during the Create Case Flag journey
    expect(summaryListValues[3]).toBeUndefined();
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
    // Flag status is expected to be displayed if the summary page is shown during the Manage Case Flags journey
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
