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

  it('should fiter current page fields and process DynamicList values back to Json', () => {
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

  describe('get field value', () => {
    describe('simple types', () => {

      it('should return value if form is a simple object', () => {
        let pageFormFields = { 'PersonFirstName': 'John' };
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('John');
      });

      it('should return value if form is a simple object recursive', () => {
        let pageFormFields = { 'PersonFirstName': 'John' };
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('John');
      });

      it('should return value if form is a collection with simple object referenced by exact key reference', () => {
        let pageFormFields = [{'value': { 'PersonFirstName': 'John' }}];
        let fieldIdToSubstitute = '0.value.PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('John');
      });

      it('should return value if form is a complex item with nonempty object', () => {
        let pageFormFields = { '_1': { 'field': 'value' }, '_2': 'two', '_3': 'three' };
        let fieldIdToSubstitute = '_1.field';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('value');
      });

      it('should return value if form is a complex item with nonempty object recursive', () => {
        let pageFormFields = { '_1': { 'field': 'value' }, '_2': 'two', '_3': 'three' };
        let fieldIdToSubstitute = '_1.field';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('value');
      });

      it('should retrieve undefined if form is a collection with one empty item', () => {
        let pageFormFields = [{}];
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if form is a simple item with no value ', () => {
        let pageFormFields = { 'PersonFirstName': null };
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeNull();
      });

      it('should return empty value if form is a simple item with empty value', () => {
        let pageFormFields = { 'PersonFirstName': '' };
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('');
      });

      it('should return empty object if form is a simple item with empty object value', () => {
        let pageFormFields = { 'PersonFirstName': {} };
        let fieldIdToSubstitute = 'PersonFirstName';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual({});
      });

      it('should return undefined referenced key is not in the form', () => {
        let pageFormFields = { '_1': 'one' };
        let fieldIdToSubstitute = '_2';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();
      });

      it('should return label value if form is an object with a collection that is multivalue list', () => {
        let pageFormFields = { '_1_one': ['code1', 'code2'], '_1_one-LABEL': ['label1', 'label2']};
        let fieldIdToSubstitute = '_1_one';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('label1, label2');
      });
    });

    describe('complex types', () => {

      it('should return leaf value', () => {
        let pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2', 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        let fieldIdToSubstitute = 'complex.nested3.doubleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBe('double nested');
      });

      it('should return undefined if complex leaf value', () => {
        let pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2', 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        let fieldIdToSubstitute = 'complex.nested3';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key has trailing delimiter', () => {
        let pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2'
            , 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        let fieldIdToSubstitute = 'complex.nested3.';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if reference key not matched', () => {
        let pageFormFields = {
          'complex': {
            'nested': 'nested value', 'nested2': 'nested value2'
            , 'nested3': { 'doubleNested': 'double nested' }
          }
        };
        let fieldIdToSubstitute = 'complex.nested21';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();

        fieldIdToSubstitute = 'complex.neste';

        actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toBeUndefined();
      });

    });

    describe('complex of collection of complex types', () => {
      it('should return collection item by index', () => {
        let pageFormFields = { 'topComplex': {
          'field': 'value',
          'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested': 'nested value2', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested8' }}}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' }}}}}
        ]}};
        let fieldIdToSubstitute = 'topComplex.collection.complex.nested2.doubleNested.trippleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBe('tripple nested8');
      });

      it('should return undefined if collection item absent for given index', () => {
        let pageFormFields = { 'topComplex': {
          'field': 'value',
          'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested2': { 'doubleNested': {'trippleNested': 'tripple nested8' }}}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' }}}}}
        ]}};
        let fieldIdToSubstitute = 'topComplex.collection.complex.nested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is complex leaf value', () => {
        let pageFormFields = { 'topComplex': {
          'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested': 'nested value2', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested8' }}}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' }}}}}
        ]}};
        let fieldIdToSubstitute = 'topComplex.collection.complex.nested2.doubleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });
    });

    describe('collection types', () => {

      it('should return simple text collection item by index', () => {
        let pageFormFields = { '_1_one': [{ 'value': 'value1' }, { 'value': 'value2' }], '_3_three': 'simpleValue' };
        let fieldIdToSubstitute = '_1_one';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('value1, value2');
      });

      it('should return simple number collection item by index', () => {
        let pageFormFields = { '_1_one': [{ 'value': 35 }, { 'value': 45 }], '_3_three': 'simpleValue' };
        let fieldIdToSubstitute = '_1_one';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 0);

        expect(actual).toEqual('35, 45');
      });

      it('should return undefined if collection item is complex leaf value', () => {
        let pageFormFields = { '_1_one': [{ 'value': { 'id': 'complex1' } }, { 'value': { 'id': 'complex2' } }],
          '_3_three': 'simpleValue' };
        let fieldIdToSubstitute = '_1_one';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is another collection', () => {
        let pageFormFields = {
          '_1_one': [{ 'value': [{ 'value': { 'id': 'complex1' } }] }, { 'value': [{ 'value': { 'id': 'complex2' } }] }],
          '_3_three': 'simpleValue'
        };
        let fieldIdToSubstitute = '_1_one';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });
    });

    describe('collection of complex types', () => {

      it('should return simple text collection item by index', () => {
        let pageFormFields = { 'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested': 'nested value2', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested8' }}}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' } }}}}
        ]};
        let fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 2);

        expect(actual).toBe('tripple nested9');
      });

      it('should return undefined if collection item absent for given index', () => {
        let pageFormFields = { 'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested': 'nested value1'}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' } }}}}
        ]};
        let fieldIdToSubstitute = 'collection.complex.nested2.doubleNested.trippleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 1);

        expect(actual).toBeUndefined();
      });

      it('should return undefined if collection item is a complex leaf value', () => {
        let pageFormFields = { 'collection': [
          { 'value': {'complex': {'nested': 'nested value1', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested7' }}}}},
          { 'value': {'complex': {'nested': 'nested value2', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested8' }}}}},
          { 'value': {'complex': {'nested': 'nested value3', 'nested2': { 'doubleNested': {'trippleNested': 'tripple nested9' } }}}}
        ]};
        let fieldIdToSubstitute = 'collection.complex.nested2.doubleNested';

        let actual = FormValueService.getFieldValue(pageFormFields, fieldIdToSubstitute, 2);

        expect(actual).toBeUndefined();
      });
    });
  });
});
