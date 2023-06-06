import { ChangeDetectorRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { FlagType } from '../../../../domain/case-flag';
import { FlagDetail } from '../domain';
import { FlagFieldDisplayPipe } from './flag-field-display.pipe';

describe('FlagFieldDisplayPipe', () => {
  const flagType = {
    name: 'Other',
    name_cy: 'Arall',
    hearingRelevant: false,
    flagComment: true,
    defaultStatus: 'Active',
    externallyAvailable: true,
    flagCode: 'OT0001',
    isParent: false,
    Path: [],
    childFlags: [],
    listOfValues: []
  } as FlagType;
  const flagDetail = {
    name: 'Other',
    name_cy: 'Arall',
    otherDescription: 'A description',
    dateTimeCreated: '',
    path: [],
    hearingRelevant: false,
    flagCode: 'OT0001',
    status: 'Active'
  } as FlagDetail;
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
      declarations: [FlagFieldDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    })
    .compileComponents();
  }));

  it('should return the English name for the flag type', () => {
    const pipe = new FlagFieldDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    expect(pipe.transform(flagType, 'name')).toEqual(flagType.name);
  });

  it('should return the Welsh name for the flag type', () => {
    const pipe = new FlagFieldDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(flagType, 'name')).toEqual(flagType.name_cy);
  });

  it('should return the English "other description" for the flag details if there is no Welsh counterpart', () => {
    const pipe = new FlagFieldDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(flagDetail, 'otherDescription')).toEqual(flagDetail.otherDescription);
  });
});
