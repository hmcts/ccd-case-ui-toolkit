import { Pipe, PipeTransform } from '@angular/core';
import { RpxTranslatePipe } from 'rpx-xui-translation';
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

  let firstError: FirstErrorPipe;

  beforeEach(() => {
    firstError = new FirstErrorPipe({
      transform: (value: string, replacements: { [key: string]: string } = {}): string => {
        Object.keys(replacements).forEach(key => {
          // Ideally use replaceAll here, but that isn't fully compatible with targeted browsers and packaging yet
          const search = `%${key}%`;
          while (value.indexOf(search) !== -1) {
            value = value.replace(search, replacements[key]);
          }
        });

        return value;
      }
    } as RpxTranslatePipe);
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
    const message = firstError.transform({
      errorkey: ERROR_MESSAGE
    });

    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return only first error when multiple errors', () => {
    const message = firstError.transform({
      errorkey: ERROR_MESSAGE,
      error2: 'some other error'
    });

    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return exact error along with label name when field value is MANDATORY', () => {
    const message = firstError.transform({
      required: true
    }, FIELD_LABEL);

    expect(message).toBe(`${FIELD_LABEL} is required`);
  });

  it('should return exact error along with label name when pattern does not match', () => {
    const message = firstError.transform({
      pattern: {actualValue: 'test ', requiredPattern: '^[0-9 +().-]{9,}$'}
    }, FIELD_LABEL);

    expect(message).toBe(`The data entered is not valid for ${FIELD_LABEL}`);
  });

  it('should return exact error along with label name when field value is below minimum length', () => {
    const message = firstError.transform({
      minlength: {actualValue: 'test', requiredLength: 5}
    }, FIELD_LABEL);

    expect(message).toBe(`${FIELD_LABEL} is below the minimum length`);
  });

  it('should return exact error along with label name when field value exceeds maximum length', () => {
    const message = firstError.transform({
      maxlength: {actualValue: 'test is done', requiredLength: 10}
    }, FIELD_LABEL);

    expect(message).toBe(`${FIELD_LABEL} exceeds the maximum length`);
  });
});
