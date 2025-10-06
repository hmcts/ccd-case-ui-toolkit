import { ChangeDetectorRef, Injector } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject } from 'rxjs';
import { Language } from '../domain';
import { LanguageInterpreterDisplayPipe } from './language-interpreter-display.pipe';
import { UpdateFlagTitleDisplayPipe } from './update-flag-title-display.pipe';

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
  let pipe: LanguageInterpreterDisplayPipe;

  beforeEach(waitForAsync(() => {
    const source = new BehaviorSubject<RpxLanguage>('en');
    let currentLanguage: RpxLanguage = 'en';
    mockRpxTranslationService = {
      language$: source.asObservable(),
      get language() {
        return currentLanguage;
      },
      set language(lang: RpxLanguage) {
        currentLanguage = lang;
        source.next(lang);
      }
    };
    mockChangeDetectorRef = {
      markForCheck: () => {}
    };
    TestBed.configureTestingModule({
      providers: [
        LanguageInterpreterDisplayPipe,
        { provide: RpxTranslationService, useValue: mockRpxTranslationService },
        { provide: ChangeDetectorRef, useValue: mockChangeDetectorRef },
        {
          provide: Injector,
          useValue: {
            get: (token: any) => {
              if (token === ChangeDetectorRef) {
                return mockChangeDetectorRef;
              }
              throw new Error('Unknown dependency');
            }
          }
        }
      ]
    });
    pipe = TestBed.inject(LanguageInterpreterDisplayPipe);
  }));

  it('should return the English name for the language', () => {
    expect(pipe.transform(language1)).toEqual(language1.value);
  });

  it('should return the Welsh name for the language', () => {
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(language1)).toEqual(language1.value_cy);
  });

  it('should return the English name for the language if there is no Welsh counterpart', () => {
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(language2)).toEqual(language2.value);
  });
});
