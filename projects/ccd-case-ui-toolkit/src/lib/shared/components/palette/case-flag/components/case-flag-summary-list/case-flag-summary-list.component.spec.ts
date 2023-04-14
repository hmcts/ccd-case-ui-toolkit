import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagSummaryListDisplayMode } from '../../enums';
import { CaseFlagSummaryListComponent } from './case-flag-summary-list.component';

describe('CaseFlagSummaryListComponent', () => {
  let component: CaseFlagSummaryListComponent;
  let fixture: ComponentFixture<CaseFlagSummaryListComponent>;
  const updateFlagHeaderText = 'Update flag for';
  const addFlagHeaderText = 'Add flag to';

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
    // Deliberately omitted fixture.detectChanges() here because this will trigger the component's ngOnInit() before
    // the flagForSummaryDisplay input value has been set in each test, causing false failures
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should display the flag summary for a flag with comments, as part of the Create Case Flag journey', () => {
    const flag = {
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
    component.flagForSummaryDisplay = flag;
    component.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = fixture.debugElement.nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
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
    component.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = fixture.debugElement.nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent.trim()).toEqual('');
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
    component.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = fixture.debugElement.nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
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
    component.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.CREATE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = fixture.debugElement.nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(addFlagHeaderText);
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(`${flag.flagDetail.name} - ${flag.flagDetail.subTypeValue}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
    // Flag status is not expected to be displayed if the summary page is shown during the Create Case Flag journey
    expect(summaryListValues[3]).toBeUndefined();
  });

  it('should display the flag summary for a flag with comments, as part of the Manage Case Flags journey', () => {
    const flag = {
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
    component.flagForSummaryDisplay = flag;
    component.summaryListDisplayMode = CaseFlagSummaryListDisplayMode.MANAGE;
    fixture.detectChanges();
    const addUpdateFlagHeaderTextElement = fixture.debugElement.nativeElement.querySelector('dt');
    expect(addUpdateFlagHeaderTextElement.textContent).toContain(updateFlagHeaderText);
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
    // Flag status is expected to be displayed if the summary page is shown during the Manage Case Flags journey
    expect(summaryListValues[3].textContent).toContain(flag.flagDetail.status);
  });
});
