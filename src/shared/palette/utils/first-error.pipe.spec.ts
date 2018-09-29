import { FirstErrorPipe } from './first-error.pipe';

describe('FirstErrorPipe', () => {

  const ERROR_MESSAGE = 'This is wrong';

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
});
