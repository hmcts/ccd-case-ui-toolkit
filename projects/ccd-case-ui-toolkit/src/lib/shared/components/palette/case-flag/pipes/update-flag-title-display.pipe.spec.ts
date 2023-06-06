import { ChangeDetectorRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { CaseField } from '../../../../domain/definition';
import { FlagDetail, FlagsWithFormGroupPath } from '../domain';
import { UpdateFlagTitleDisplayPipe } from './update-flag-title-display.pipe';

describe('UpdateFlagTitleDisplayPipe', () => {
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
        partyName: '',
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
      }
    };
    mockChangeDetectorRef = {
      markForCheck: () => {}
    };
    TestBed.configureTestingModule({
      declarations: [UpdateFlagTitleDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    })
    .compileComponents();
  }));

  it('should get correct flag name', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    let flagDetail = flagsData[2].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 4');
    flagDetail = flagsData[3].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 5, Dummy subtype value');
    flagDetail = flagsData[0].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 1');
  });

  it('should get correct flag name when page language is set to Welsh', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    let flagDetail = flagsData[3].flags.details[0];
    expect(pipe.getFlagName(flagDetail)).toEqual('Fflag 5, Dummy subtype value - Welsh');
    flagDetail = flagsData[0].flags.details[0];
    // No Welsh flag name is available (undefined name_cy), so fall back on English name
    expect(pipe.getFlagName(flagDetail)).toEqual('Flag 1');
  });

  it('should get flag comment', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    expect(pipe.getFlagComments(flagsData[3].flags.details[0])).toEqual(' - Fifth flag');
  });

  it('should get flag comment when page language is set to Welsh', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.getFlagComments(flagsData[3].flags.details[0])).toEqual(' - Fifth flag - Welsh');
    // No Welsh flag comment is available (undefined flagComment_cy), so fall back on English comment
    expect(pipe.getFlagComments(flagsData[2].flags.details[0])).toEqual(' - Fourth flag');
  });

  it('should return the English formatted string for the flag details', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    const flagDetail = flagsData[3].flags.details[0];
    expect(pipe.transform(flagDetail)).toEqual('Flag 5, Dummy subtype value - Fifth flag');
  });

  it('should return the Welsh formatted string for the flag details', () => {
    const pipe = new UpdateFlagTitleDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    const flagDetail = flagsData[3].flags.details[0];
    expect(pipe.transform(flagDetail)).toEqual('Fflag 5, Dummy subtype value - Welsh - Fifth flag - Welsh');
  });
});
