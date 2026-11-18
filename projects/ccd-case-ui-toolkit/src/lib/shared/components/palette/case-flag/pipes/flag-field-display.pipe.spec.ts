import { ChangeDetectorRef, Injector } from '@angular/core';
import { TestBed, waitForAsync } from '@angular/core/testing';
import { RpxLanguage, RpxTranslationService } from 'rpx-xui-translation';
import { BehaviorSubject, of } from 'rxjs';
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
  let pipe: FlagFieldDisplayPipe;

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
        FlagFieldDisplayPipe,
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
    pipe = TestBed.inject(FlagFieldDisplayPipe);
  }));

  it('should return the English name for the flag type', () => {
    expect(pipe.transform(flagType, 'name')).toEqual(flagType.name);
  });

  it('should return the Welsh name for the flag type', () => {
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(flagType, 'name')).toEqual(flagType.name_cy);
  });

  it('should return the English "other description" for the flag details if there is no Welsh counterpart', () => {
    mockRpxTranslationService.language = 'cy';
    expect(pipe.transform(flagDetail, 'otherDescription')).toEqual(flagDetail.otherDescription);
  });
  it('delegates an observable when called with one argument', () => {
    expect(pipe.transform(of('observable value'))).toEqual('observable value');
  });

  it('delegates a PromiseLike when called with one argument', async () => {
    const promiseLike: PromiseLike<string> = { then: (resolve, reject) => Promise.resolve('promise value').then(resolve, reject) };
    expect(pipe.transform(promiseLike)).toBeNull();
    await Promise.resolve();
    expect(pipe.transform(promiseLike)).toEqual('promise value');
  });

  it('returns null for an empty asynchronous input', () => {
    expect(pipe.transform(null)).toBeNull();
    expect(pipe.transform(undefined)).toBeNull();
  });

  it('switches between flag and async inputs without retaining the prior subscription', () => {
    const values = new BehaviorSubject('first');
    expect(pipe.transform(values)).toEqual('first');
    expect(values.observed).toBeTrue();
    expect(pipe.transform(flagType, 'name')).toEqual('Other');
    expect(values.observed).toBeFalse();
    expect(pipe.transform(values)).toEqual('first');
    expect(values.observed).toBeTrue();
    expect(pipe.transform(null)).toBeNull();
    expect(values.observed).toBeFalse();
  });

  it('disposes the previous async input when the requested flag field is absent', () => {
    const values = new BehaviorSubject('first');
    expect(pipe.transform(values)).toEqual('first');
    expect(values.observed).toBeTrue();
    expect(pipe.transform(flagType, 'missing')).toBeNull();
    expect(values.observed).toBeFalse();
  });

});
