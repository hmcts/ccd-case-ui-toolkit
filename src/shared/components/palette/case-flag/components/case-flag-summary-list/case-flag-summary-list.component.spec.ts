import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { FlagDetail, FlagDetailDisplay } from '../../domain';
import { CaseFlagSummaryListComponent } from './case-flag-summary-list.component';

describe('CaseFlagSummaryListComponent', () => {
  let component: CaseFlagSummaryListComponent;
  let fixture: ComponentFixture<CaseFlagSummaryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ ReactiveFormsModule ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseFlagSummaryListComponent ]
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

  it('should display the flag summary for a flag with comments', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Flag 1',
        flagComment: 'First flag',
        dateTimeCreated: new Date(),
        path: [{ id: null, value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    fixture.detectChanges();
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
  });

  it('should display the flag summary for a flag without comments', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Flag 1',
        flagComment: '',
        dateTimeCreated: new Date(),
        path: [{ id: null, value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    fixture.detectChanges();
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(flag.flagDetail.name);
    expect(summaryListValues[2].textContent.trim()).toEqual('');
  });

  it('should display the flag summary for the "Other" flag type with a description', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Other',
        otherDescription: 'A different flag',
        flagComment: 'First flag',
        dateTimeCreated: new Date(),
        path: [{ id: null, value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    fixture.detectChanges();
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(`${flag.flagDetail.name} - ${flag.flagDetail.otherDescription}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
  });

  it('should display the flag summary for a flag that has a sub-type value', () => {
    const flag = {
      partyName: 'Rose Bank',
      flagDetail: {
        name: 'Sign Language Interpreter',
        subTypeValue: 'British Sign Language (BSL)',
        flagComment: 'First flag',
        dateTimeCreated: new Date(),
        path: [{ id: null, value: 'Reasonable adjustment' }],
        hearingRelevant: false,
        flagCode: 'FL1',
        status: 'Active'
      } as FlagDetail
    } as FlagDetailDisplay;
    component.flagForSummaryDisplay = flag;
    fixture.detectChanges();
    const summaryListValues = fixture.debugElement.nativeElement.querySelectorAll('dd');
    expect(summaryListValues[0].textContent).toContain(flag.partyName);
    expect(summaryListValues[1].textContent).toContain(`${flag.flagDetail.name} - ${flag.flagDetail.subTypeValue}`);
    expect(summaryListValues[2].textContent).toContain(flag.flagDetail.flagComment);
  });
});
