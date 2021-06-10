import { FirstErrorPipe } from './first-error.pipe';

describe('FirstErrorPipe', () => {

  const ERROR_MESSAGE = 'This is wrong';
  const Field_Label = 'Field1'

  let firstError: FirstErrorPipe;

  beforeEach(() => {
    firstError = new FirstErrorPipe();
  });

  it('should return empty string when null errors', () => {
    let message = firstError.transform(null);

    expect(message).toBe('');
  });

  it('should return empty string when empty errors', () => {
    let message = firstError.transform({});

    expect(message).toBe('');
  });

  it('should return only error when 1 error', () => {
    let message = firstError.transform({
      'errorkey': ERROR_MESSAGE
    });

    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return only first error when multiple errors', () => {
    let message = firstError.transform({
      'errorkey': ERROR_MESSAGE,
      'error2': 'some other error'
    });

    expect(message).toBe(ERROR_MESSAGE);
  });

  it('should return exact error along with label name when field value is MANDATORY', () => {
    let message = firstError.transform({
      'required': true
    }, Field_Label);

    expect(message).toBe(`${Field_Label} is required`);
  });

  it('should return exact error along with label name when pattern does not match', () => {
    let message = firstError.transform({
      'pattern': {'actualValue': 'test ', 'requiredPattern': '^[0-9 +().-]{9,}$'}
    }, Field_Label);

    expect(message).toBe(`The data entered is not valid for ${Field_Label}`);
  });

  it('should return exact error along with label name when field value is below minimum length', () => {
    let message = firstError.transform({
      'minlength': {'actualValue': 'test', 'requiredLength': 5}
    }, Field_Label);

    expect(message).toBe(`${Field_Label} is below the minimum length`);
  });

  it('should return exact error along with label name when field value exceeds maximum length', () => {
    let message = firstError.transform({
      'maxlength': {'actualValue': 'test is done', 'requiredLength': 10}
    }, Field_Label);

    expect(message).toBe(`${Field_Label} exceeds the maximum length`);
  });
});
