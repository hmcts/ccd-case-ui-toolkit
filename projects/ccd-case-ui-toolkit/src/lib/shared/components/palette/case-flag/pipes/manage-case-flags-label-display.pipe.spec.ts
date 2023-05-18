import { ChangeDetectorRef } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CaseField } from '../../../../domain/definition';
import { FlagDetail, FlagDetailDisplayWithFormGroupPath, FlagsWithFormGroupPath } from '../domain';
import { ManageCaseFlagsLabelDisplayPipe } from './manage-case-flags-label-display.pipe';

describe('ManageCaseFlagsLabelDisplayPipe', () => {
  const flagsData = [
    {
      flags: {
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
      pathToFlagsFormGroup: '',
      caseField: {
        id: 'CaseFlag1'
      } as CaseField
    },
    {
      flags: {
        partyName: 'Tom Atin',
        details: [
          {
            id: '7890',
            name: 'Flag X',
            flagComment: 'Flag not approved',
            dateTimeCreated: new Date(),
            path: [{ id: null, value: 'Reasonable adjustment' }],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Not approved'
          },
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
      },
      pathToFlagsFormGroup: '',
      caseField: {
        id: 'CaseFlag2'
      } as CaseField
    },
    {
      flags: {
        partyName: '',
        details: [
          {
            id: '4567',
            name: 'Flag 4',
            flagComment: 'Fourth flag',
            dateTimeCreated: new Date(),
            path: [
              { id: null, value: 'Level 1' },
              { id: null, value: 'Level 2' }
            ],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Active'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3'
      } as CaseField
    },
    {
      flags: {
        partyName: 'Brent Ford',
        details: [
          {
            id: '5678',
            name: 'Flag 5',
            name_cy: 'Fflag 5',
            flagComment: 'Fifth flag',
            flagComment_cy: 'Fifth flag - Welsh',
            dateTimeCreated: new Date(),
            path: [
              { id: null, value: 'Level 1' }
            ],
            hearingRelevant: false,
            flagCode: 'FL1',
            status: 'Active',
            subTypeKey: 'Dummy subtype key',
            subTypeValue: 'Dummy subtype value',
            subTypeValue_cy: 'Dummy subtype value - Welsh'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: {
        id: 'CaseFlag3'
      } as CaseField
    },
    {
      flags: {
        partyName: 'Brent Ford',
        roleOnCase: 'Applicant 1',
        details: [
          {
            id: '5678',
            name: 'Other',
            name_cy: 'Arall',
            otherDescription: 'Flag description',
            otherDescription_cy: 'Flag description - Welsh',
            flagComment: 'Sixth flag',
            flagComment_cy: 'Sixth flag - Welsh',
            dateTimeCreated: new Date(),
            path: [
              { id: null, value: 'Level 1' }
            ],
            hearingRelevant: false,
            flagCode: 'OT0001',
            status: 'Active'
          }
        ] as FlagDetail[],
        flagsCaseFieldId: 'CaseFlag3'
      },
      pathToFlagsFormGroup: '',
      caseField: {
        id: 'CaseFlag3'
      } as CaseField
    }
  ] as FlagsWithFormGroupPath[];
  let mockRpxTranslationService: any;
  let mockChangeDetectorRef: any;

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
      },
      getTranslation(_: string): Observable<string> {
        // Use delayed Observable to better simulate response from the RpxTranslationService
        return of('Dummy Welsh translation').pipe(delay(500));
      }
    };
    mockChangeDetectorRef = {
      markForCheck: () => {}
    };
    TestBed.configureTestingModule({
      declarations: [ManageCaseFlagsLabelDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    })
    .compileComponents();
  }));

  it('should get correct party name', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: flagsData[2].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    pipe.getPartyName(flagDisplay).subscribe(partyName => {
      expect(partyName).toEqual('Case level');
    });
    flagDisplay.pathToFlagsFormGroup = null;
    pipe.getPartyName(flagDisplay).subscribe(partyName => {
      expect(partyName).toEqual('');
    });
  });

  it('should get correct party name when page language is set to Welsh', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: flagsData[2].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    pipe.getPartyName(flagDisplay).subscribe(partyName => {
      expect(partyName).toEqual('Dummy Welsh translation');
    });
    flagDisplay.pathToFlagsFormGroup = null;
    pipe.getPartyName(flagDisplay).subscribe(partyName => {
      expect(partyName).toEqual('');
    });
  });

  it('should get correct flag name', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    let flagDetail = flagsData[2].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Level 2');
    flagDetail = flagsData[3].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 5, Dummy subtype value');
    flagDetail = flagsData[0].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 1');
  });

  it('should get correct flag name when page language is set to Welsh', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    let flagDetail = flagsData[2].flags.details[0];
    // Currently, flag path values are stored in English only
    expect(pipe.getFlagName(flagDetail)).toEqual('Level 2');
    flagDetail = flagsData[3].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Fflag 5, Dummy subtype value - Welsh');
    flagDetail = flagsData[0].flags.details[0];
    // No Welsh flag name is available (undefined name_cy), so fall back on English name
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 1');
  });

  it('should get party role on case', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[2].caseField,
      roleOnCase: 'Applicant'
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.getRoleOnCase(flagDisplay)).toEqual(' (Applicant)');
  });

  it('should get flag comment', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    expect(pipe.getFlagComments(flagsData[3].flags.details[0])).toEqual(' (Fifth flag)');
  });

  it('should get flag comment when page language is set to Welsh', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.getFlagComments(flagsData[3].flags.details[0])).toEqual(' (Fifth flag - Welsh)');
    // No Welsh flag comment is available (undefined flagComment_cy), so fall back on English comment
    expect(pipe.getFlagComments(flagsData[2].flags.details[0])).toEqual(' (Fourth flag)');
  });

  it('should return the English formatted string for the case-level flag details', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[3].flags.partyName,
        flagDetail: flagsData[3].flags.details[0],
        flagsCaseFieldId: flagsData[3].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: flagsData[3].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.transform(flagDisplay)).toEqual(
      'Case level - <span class="flag-name-and-description">Flag 5, Dummy subtype value</span> (Fifth flag)');
  });

  it('should return the English formatted string for the party-level flag details', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[3].flags.partyName,
        flagDetail: flagsData[3].flags.details[0],
        flagsCaseFieldId: flagsData[3].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[3].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.transform(flagDisplay)).toEqual(
      'Brent Ford - <span class="flag-name-and-description">Flag 5, Dummy subtype value</span> (Fifth flag)');
  });

  it('should return the English formatted string for the party-level flag details with child flags', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[2].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.transform(flagDisplay)).toEqual(
      ' - <span class="flag-name-and-description">Level 2, Flag 4</span> (Fourth flag)');
  });

  it('should return the English formatted string for the flag details of flag type "Other" with party role on case', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[4].flags.partyName,
        flagDetail: flagsData[4].flags.details[0],
        flagsCaseFieldId: flagsData[4].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[4].caseField,
      roleOnCase: flagsData[4].flags.roleOnCase
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.transform(flagDisplay)).toEqual(
      'Brent Ford (Applicant 1) - <span class="flag-name-and-description">Other, Flag description</span> (Sixth flag)');
  });

  it('should return the Welsh formatted string for the case-level flag details', fakeAsync(() => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[3].flags.partyName,
        flagDetail: flagsData[3].flags.details[0],
        flagsCaseFieldId: flagsData[3].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: 'caseFlags',
      caseField: flagsData[3].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    // Two calls to pipe.transform() needed because first call makes a call to the asynchronous getTranslation() function
    // in RpxTranslationService
    pipe.transform(flagDisplay);
    // Tick() duration needs to match the delay specified in the getTranslation() function for the mock
    // RpxTranslationService
    tick(500);
    // Second call to pipe.transform() will returned the cached Observable
    expect(pipe.transform(flagDisplay)).toEqual(
      'Dummy Welsh translation - <span class="flag-name-and-description">Fflag 5, Dummy subtype value - Welsh</span> (Fifth flag - Welsh)');
  }));

  it('should return the Welsh formatted string for the party-level flag details', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[3].flags.partyName,
        flagDetail: flagsData[3].flags.details[0],
        flagsCaseFieldId: flagsData[3].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[3].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    expect(pipe.transform(flagDisplay)).toEqual(
      'Brent Ford - <span class="flag-name-and-description">Fflag 5, Dummy subtype value - Welsh</span> (Fifth flag - Welsh)');
  });

  it('should return the Welsh formatted string for the party-level flag details with child flags', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[2].flags.partyName,
        flagDetail: flagsData[2].flags.details[0],
        flagsCaseFieldId: flagsData[2].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[2].caseField
    } as FlagDetailDisplayWithFormGroupPath;
    // The resulting string is expected to be the same as the English version because this case flag has no Welsh
    // name (name_cy) nor Welsh comments (flagComment_cy), so it falls back on the English name and comments
    expect(pipe.transform(flagDisplay)).toEqual(
      ' - <span class="flag-name-and-description">Level 2, Flag 4</span> (Fourth flag)');
  });

  it('should return the Welsh formatted string for the flag details of flag type "Other" with party role on case', () => {
    const pipe = new ManageCaseFlagsLabelDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDisplay = {
      flagDetailDisplay: {
        partyName: flagsData[4].flags.partyName,
        flagDetail: flagsData[4].flags.details[0],
        flagsCaseFieldId: flagsData[4].flags.flagsCaseFieldId
      },
      pathToFlagsFormGroup: '',
      caseField: flagsData[4].caseField,
      roleOnCase: flagsData[4].flags.roleOnCase
    } as FlagDetailDisplayWithFormGroupPath;
    // The roleOnCase value is not stored in Welsh anywhere in the Flags object, so it can only be displayed in English
    expect(pipe.transform(flagDisplay)).toEqual(
      'Brent Ford (Applicant 1) - <span class="flag-name-and-description">Arall, Flag description - Welsh</span> (Sixth flag - Welsh)');
  });
});
