import { ChangeDetectorRef } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../domain';
import { LanguageInterpreterDisplayPipe } from './language-interpreter-display.pipe';

describe('LanguageInterpreterDisplayPipe', () => {
  const language1 = {
    key: 'FR',
    value: 'French',
    value_cy: 'Ffrangeg'
  } as Language;
  const language2 = {
    key: 'EO',
    value: 'Esperanto',
    value_cy: ''
  } as Language;
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
      declarations: [LanguageInterpreterDisplayPipe],
      providers: [
        { provide: RpxTranslationService, useValue: mockRpxTranslationService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef }
      ]
    })
    .compileComponents();
  }));

  it('should return the English name for the language', () => {
    const pipe = new LanguageInterpreterDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    expect(pipe.transform(language1)).toEqual(language1.value);
  });

  it('should return the Welsh name for the language', () => {
    const pipe = new LanguageInterpreterDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(language1)).toEqual(language1.value_cy);
  });

  it('should return the English name for the language if there is no Welsh counterpart', () => {
    const pipe = new LanguageInterpreterDisplayPipe(mockRpxTranslationService, mockChangeDetectorRef);
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(language2)).toEqual(language2.value);
  });
});
