import { ChangeDetectorRef, Injector, Pipe, PipeTransform } from '@angular/core';
import { Replacements, RpxTranslationService } from 'rpx-xui-translation';
import { of } from 'rxjs';
import { FirstErrorPipe } from './first-error.pipe';

@Pipe({ name: 'rpxTranslate' })
export class MockRpxTranslatePipe implements PipeTransform {
  public transform(value: string, args: { [key: string]: string } = {}) {
    return value;
  }
}

describe('FirstErrorPipe', () => {
  const ERROR_MESSAGE = 'This is wrong';
  const FIELD_LABEL = 'Field1';

  let translationServiceMock: jasmine.SpyObj<RpxTranslationService>;
  let changeDetectorRefMock: jasmine.SpyObj<ChangeDetectorRef>;
  let injectorMock: jasmine.SpyObj<Injector>;
  let firstError: FirstErrorPipe;

  beforeEach(() => {
    translationServiceMock = jasmine.createSpyObj('RpxTranslationService', ['getTranslation$', 'getTranslationWithReplacements$']);
    changeDetectorRefMock = jasmine.createSpyObj('ChangeDetectorRef', ['markForCheck']);
    injectorMock = jasmine.createSpyObj('Injector', ['get']);
    injectorMock.get.and.returnValue(changeDetectorRefMock);
    firstError = new FirstErrorPipe(translationServiceMock, injectorMock);
    translationServiceMock.getTranslation$.and.callFake((someString: string) => of(someString));
  });

  it('should return empty string when null errors', () => {
    const message = firstError.transform(null);

    expect(message).toBe('');
  });

  it('should return empty string when empty errors', () => {
    const message = firstError.transform({});

    expect(message).toBe('');
  });

  it('should return only error when 1 error', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      errorkey: ERROR_MESSAGE
    });

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith('Field');
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(ERROR_MESSAGE, { FIELDLABEL: 'Field' });
    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return only first error when multiple errors', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      errorkey: ERROR_MESSAGE,
      error2: 'some other error'
    });

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith('Field');
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(ERROR_MESSAGE, { FIELDLABEL: 'Field' });
    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return exact error along with label name when field value is MANDATORY', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      required: true
    }, FIELD_LABEL);

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith(FIELD_LABEL);
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(
      '%FIELDLABEL% is required', { FIELDLABEL: FIELD_LABEL });
    expect(message).toBe(`${FIELD_LABEL} is required`);
  });

  it('should return exact error along with label name when pattern does not match', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      pattern: {actualValue: 'test ', requiredPattern: '^[0-9 +().-]{9,}$'}
    }, FIELD_LABEL);

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith(FIELD_LABEL);
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(
      'The data entered is not valid for %FIELDLABEL%', { FIELDLABEL: FIELD_LABEL });
    expect(message).toBe(`The data entered is not valid for ${FIELD_LABEL}`);
  });

  it('should return exact error along with label name when field value is below minimum length', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      minlength: {actualValue: 'test', requiredLength: 5}
    }, FIELD_LABEL);

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith(FIELD_LABEL);
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(
      '%FIELDLABEL% is below the minimum length', { FIELDLABEL: FIELD_LABEL });
    expect(message).toBe(`${FIELD_LABEL} is below the minimum length`);
  });

  it('should return exact error along with label name when field value exceeds maximum length', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      maxlength: {actualValue: 'test is done', requiredLength: 10}
    }, FIELD_LABEL);

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith(FIELD_LABEL);
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(
      '%FIELDLABEL% exceeds the maximum length', { FIELDLABEL: FIELD_LABEL });
    expect(message).toBe(`${FIELD_LABEL} exceeds the maximum length`);
  });

  it('should return exact error along with label name when field value is not valid date', () => {
    translationServiceMock.getTranslationWithReplacements$.and.callFake(
      (someString: string, someReplacements: Replacements) => of(someString.replace('%FIELDLABEL%', someReplacements['FIELDLABEL'])));
    const message = firstError.transform({
      matDatetimePickerParse: true
    }, FIELD_LABEL);
    const errorMessage = 'The date entered is not valid. Please provide a valid date';

    expect(translationServiceMock.getTranslation$).toHaveBeenCalledWith(FIELD_LABEL);
    expect(translationServiceMock.getTranslationWithReplacements$).toHaveBeenCalledWith(errorMessage, { FIELDLABEL: FIELD_LABEL });
    expect(message).toBe(errorMessage);
  });
});
