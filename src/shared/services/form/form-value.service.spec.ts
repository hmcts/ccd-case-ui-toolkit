import { FormValueService } from './form-value.service';
import { CaseField, FieldType } from '../../domain/definition';
import { FieldTypeSanitiser } from './field-type-sanitiser';

describe('FormValueService', () => {

  let formValueService: FormValueService;

  beforeEach(() => {
    formValueService = new FormValueService(new FieldTypeSanitiser());
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

  it('should filter current page fields and process DynamicList values back to Json', () => {
    let formFields = {data: {dynamicList: 'L2', thatTimeOfTheDay: {}}};
    let caseField = new CaseField();
    let fieldType = new FieldType();
    fieldType.type = 'DynamicList';
    caseField.id = 'dynamicList';
    caseField.field_type = fieldType
    caseField.value = {
      value: {code: 'L1', label: 'List 1'},
      list_items: [{code: 'L1', label: 'List 1'}, {code: 'L2', label: 'List 2'}]
    }
    let caseFields = [caseField];
    formValueService.sanitiseDynamicLists(caseFields, formFields);
    let actual = '{"value":{"code":"L2","label":"List 2"},"list_items":[{"code":"L1","label":"List 1"},{"code":"L2","label":"List 2"}]}';
    expect(JSON.stringify(formFields.data.dynamicList))
      .toEqual(actual);
  })
});
