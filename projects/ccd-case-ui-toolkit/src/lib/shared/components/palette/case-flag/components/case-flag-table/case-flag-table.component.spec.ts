import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MockRpxTranslatePipe } from '../../../../../../shared/test/mock-rpx-translate.pipe';
import { CaseFlagStatus } from '../../enums';
import { CaseFlagTableComponent } from './case-flag-table.component';

describe('CaseFlagTableComponent', () => {
  let component: CaseFlagTableComponent;
  let fixture: ComponentFixture<CaseFlagTableComponent>;
  const flagData = {
    flags: {
      partyName: 'John Smith',
      roleOnCase: '',
      details: [{
        name: 'Wheel chair access',
        subTypeValue: '',
        subTypeKey: '',
        otherDescription: '',
        flagComment: '',
        flagUpdateComment: 'Flag update comment for first flag',
        dateTimeModified: new Date('2021-09-09 00:00:00'),
        dateTimeCreated: new Date('2021-09-09 00:00:00'),
        path: [],
        hearingRelevant: false,
        flagCode: '',
        status: CaseFlagStatus.ACTIVE
      },
      {
        name: 'Sign language',
        subTypeValue: 'British Sign Language (BSL)',
        subTypeKey: '',
        otherDescription: '',
        flagComment: '',
        flagUpdateComment: 'Flag update comment for second flag',
        dateTimeModified: new Date('2021-09-09 00:00:00'),
        dateTimeCreated: new Date('2021-09-09 00:00:00'),
        path: [],
        hearingRelevant: false,
        flagCode: '',
        status: CaseFlagStatus.ACTIVE
      }]
    },
    pathToFlagsFormGroup: '',
    caseField: null
  };

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      declarations: [CaseFlagTableComponent, MockRpxTranslatePipe]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFlagTableComponent);
    component = fixture.componentInstance;
    component.caseFlagsExternalUser = false;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display case flag table if there is case flag data', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const tableElement = fixture.debugElement.nativeElement.querySelector('govuk-table');
    expect(tableElement).toBeDefined();
  });

  it('should not display case flag table if there is no case flag data', () => {
    component.flagData = null;
    fixture.detectChanges();
    const tableElement = fixture.debugElement.nativeElement.querySelector('govuk-table');
    expect(tableElement).toBeNull();
  });

  it('should not display the blank column when displaying case flags', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const caseViewerFieldLabelElement = fixture.debugElement.nativeElement.querySelector('#case-viewer-field-label');
    expect(caseViewerFieldLabelElement).toBeNull();
  });

  it('should display the sub-type value (i.e. language name) when displaying a "language interpreter" case flag type', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the first element of the second row of five (i.e. sixth element) contains the language name
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].subTypeValue);
  });

  it('should display the flag update comment for internal users if and only if the case flag status is "Not approved"', () => {
    flagData.flags.details[1].status = CaseFlagStatus.NOT_APPROVED;
    component.flagData = flagData;
    fixture.detectChanges();
    let tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the second element of the second row of five (i.e. seventh element) contains the flag update comment
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[6].textContent).toContain(`Decision Reason: ${flagData.flags.details[1].flagUpdateComment}`);
    // Change flag status to other than "Not approved", which should hide the flag update comment
    flagData.flags.details[1].status = CaseFlagStatus.ACTIVE;
    component.flagData = flagData;
    fixture.detectChanges();
    tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the second element of the second row of five (i.e. seventh element) does not contain the flag update comment
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[6].textContent).not.toContain(`Decision Reason: ${flagData.flags.details[1].flagUpdateComment}`);
  });

  it('should not display the flag update comment for external users even if the case flag status is "Not approved"', () => {
    flagData.flags.details[1].status = CaseFlagStatus.NOT_APPROVED;
    component.flagData = flagData;
    component.caseFlagsExternalUser = true;
    fixture.detectChanges();
    const tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the second element of the second row of five (i.e. seventh element) does not contain the flag update comment
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[6].textContent).not.toContain(`Decision Reason: ${flagData.flags.details[1].flagUpdateComment}`);
  });

  it('should not display "Decision Reason: " for internal users if there is no flag update comment for a "Not approved" flag', () => {
    flagData.flags.details[1].status = CaseFlagStatus.NOT_APPROVED;
    flagData.flags.details[1].flagUpdateComment = null;
    component.flagData = flagData;
    fixture.detectChanges();
    const tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the second element of the second row of five (i.e. seventh element) does not contain "Decision Reason: "
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[6].textContent).not.toContain('Decision Reason: ');
  });
});
