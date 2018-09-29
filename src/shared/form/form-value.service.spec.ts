import { FormValueService } from './form-value.service';

describe('FormValueService', () => {

  let formValueService: FormValueService;

  beforeEach(() => {
    formValueService = new FormValueService();
  });

  it('should return null when given null', () => {
    let value = formValueService.sanitise(null);

    expect(value).toEqual(null);
  });

  it('should trim spaces from strings', () => {
    let value = formValueService.sanitise({
      'string1': '     x     ',
      'string2': '     y      '
    });

    expect(value).toEqual({
      'string1': 'x',
      'string2': 'y'
    } as object);
  });

  it('should trim spaces from strings recursively', () => {
    let value = formValueService.sanitise({
      'object': {
        'string1': '    x     '
      },
      'string2': '     y      '
    });

    expect(value).toEqual({
      'object': {
        'string1': 'x'
      },
      'string2': 'y'
    } as object);
  });

  it('should trim spaces from strings in collection', () => {
    let value = formValueService.sanitise({
      'collection': [
        {
          'value': '      x        '
        }
      ]
    });

    expect(value).toEqual({
      'collection': [
        {
          'value': 'x'
        }
      ]
    } as object);
  });

  it('should convert numbers to strings', () => {
    let value = formValueService.sanitise({
      'number': 42
    });

    expect(value).toEqual({
      'number': '42'
    } as object);
  });
});
