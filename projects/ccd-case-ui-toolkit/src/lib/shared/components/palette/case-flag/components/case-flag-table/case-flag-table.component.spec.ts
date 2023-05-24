import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { MockRpxTranslatePipe } from '../../../../../test/mock-rpx-translate.pipe';
import { FlagDetail } from '../../domain';
import { CaseFlagStatus } from '../../enums';
import { FlagFieldDisplayPipe } from '../../pipes';
import { CaseFlagTableComponent } from './case-flag-table.component';

describe('CaseFlagTableComponent', () => {
  let component: CaseFlagTableComponent;
  let fixture: ComponentFixture<CaseFlagTableComponent>;
  let mockRpxTranslationService: any;
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
        name: 'Sign Language Interpreter',
        name_cy: 'Dehonglydd Iaith Arwyddion',
        subTypeValue: 'British Sign Language (BSL)',
        subTypeValue_cy: 'Iaith Arwyddion Prydain (BSL)',
        subTypeKey: 'bfi',
        otherDescription: 'English description for Other',
        otherDescription_cy: 'Disgrifiad Cymraeg ar gyfer Arall',
        flagComment: 'An English comment',
        flagComment_cy: 'Sylw Cymreig',
        flagUpdateComment: 'Flag update comment for second flag',
        dateTimeModified: new Date('2021-09-09 00:00:00'),
        dateTimeCreated: new Date('2021-09-09 00:00:00'),
        path: [],
        hearingRelevant: false,
        flagCode: '',
        status: CaseFlagStatus.ACTIVE
      }] as FlagDetail[]
    },
    pathToFlagsFormGroup: '',
    caseField: null
  };

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
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [ CaseFlagTableComponent, MockRpxTranslatePipe, FlagFieldDisplayPipe ],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaseFlagTableComponent);
    component = fixture.componentInstance;
    component.caseFlagsExternalUser = false;
    // Set default translation language to English
    mockRpxTranslationService.language = 'en';
    fixture.detectChanges();
  });

  it('should create component', () => {
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

  it('should display English values for flag name, "Other" description, sub-type value, and comments if in default language', () => {
    component.flagData = flagData;
    fixture.detectChanges();
    const tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the first element of the second row of five (i.e. sixth element) contains content in English
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].name);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].otherDescription);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].subTypeValue);
    // Check that the second element of the second row of five (i.e. seventh element) contains comments in English
    expect(tableCellElements[6].textContent).toContain(flagData.flags.details[1].flagComment);
  });

  it('should display Welsh values for flag name, "Other" description, sub-type value, and comments if in Welsh language mode', () => {
    mockRpxTranslationService.language = 'cy';
    component.flagData = flagData;
    fixture.detectChanges();
    const tableCellElements = fixture.debugElement.nativeElement.querySelectorAll('.govuk-table__cell');
    // Check that the first element of the second row of five (i.e. sixth element) contains content in Welsh
    expect(tableCellElements.length).toBe(10);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].name_cy);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].otherDescription_cy);
    expect(tableCellElements[5].textContent).toContain(flagData.flags.details[1].subTypeValue_cy);
    // Check that the second element of the second row of five (i.e. seventh element) contains comments in Welsh
    expect(tableCellElements[6].textContent).toContain(flagData.flags.details[1].flagComment_cy);
  });
});
