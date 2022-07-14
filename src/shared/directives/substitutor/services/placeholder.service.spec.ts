import { PlaceholderService } from './placeholder.service';

describe('PlaceholderService', () => {

  let placeholderService: PlaceholderService;
  beforeEach(() => {
    placeholderService = new PlaceholderService();
  });

  describe('simple types', () => {

    it('should not substitute if no page form fields', () => {
      const pageFormFields = [{}];
      const stringToResolve = 'Email for ${PersonFirstName} is';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for  is');
    });

    it('should not substitute if stringToResolve is null', () => {
      const pageFormFields = [{ PersonFirstName: 'John' }];
      const stringToResolve = null;

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBeNull();
    });

    it('should substitute with empty value if page form field is matched and has null value', () => {
      const pageFormFields = { PersonFirstName: null };
      const stringToResolve = 'Email for ${PersonFirstName} is';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for  is');
    });

    it('should substitute with empty value if page form field is matched and has empty value', () => {
      const pageFormFields = { PersonFirstName: '' };
      const stringToResolve = 'Email for ${PersonFirstName} is';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for  is');
    });

    it('should substitute with value if page form field is matched and has value', () => {
      const pageFormFields = { Age: 34, PersonFirstName: 'John' };
      const stringToResolve = 'Email for ${PersonFirstName} of ${Age} is';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for John of 34 is');
    });

    it('should substitute with multiple values multiple times if page form field is matched and has value', () => {
      const pageFormFields = { PersonFirstName: 'John', PersonLastName: 'Smith' };
      const stringToResolve = 'Email for ${PersonFirstName} ${PersonLastName} is ${PersonFirstName}.${PersonLastName}@gmail.com';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for John Smith is John.Smith@gmail.com');
    });

    it('should only substitute with the values that are matched from page form fields', () => {
      const pageFormFields = { Age: null, Markdownlabel: null, PersonAddress: {}, D8Document: 'photo.jpg' };
      const stringToResolve = `First Name is \${Age} years old \${Age} \
and markdown is \${Markdownlabel} and address is \${Address} and document \${D8Document}`;

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('First Name is  years old  and markdown is  and address is  and document photo.jpg');
    });

    it('should not substitute fields ids with special characters but _', () => {
      const pageFormFields = { _1: 'one', '%2': 'two', '?3': { field: 'value' }, $4: 'four', _5: 'five' };
      const stringToResolve = '${_1} ${%2} ${?3} ${$4} {_5}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('one    {_5}');
    });

    it('should not substitute nested fields', () => {
      const pageFormFields = { _1: 'one' };
      const stringToResolve = 'This ${_1} but not this ${${_1}} and not this ${field${_1}field} but this ${_1} too';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('This one but not this  and not this  but this one too');
    });

    it('should not substitute if value of a field to substitute refers itself', () => {
      const pageFormFields = { _1_one: '${_1_one}', _2_two: 'two' };
      const stringToResolve = '${_1_one} ${_2_two}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(' two');
    });

    it('should not substitute if placeholder is missing characters', () => {
      const pageFormFields = { _1_one: '${_1_one}', _2_two: 'two' , three : 'three'};
      const stringToResolve = '${_1_one ${_2_two} {three}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('${_1_one two {three}');
    });

    it('should substitute fields with multi select values', () => {
      const pageFormFields = { _1_one: ['code1', 'code2'], '_1_one---LABEL': ['label1', 'label2'], _3_three: 'simpleValue' };
      const stringToResolve = '${_1_one} ${_3_three}';
      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('label1, label2 simpleValue');
    });
  });

  describe('complex types', () => {

    it('should substitute complex nested field with simple type leaf value', () => {
      const pageFormFields = {
        complex: {
          nested: 'nested value', nested2: 'nested value2'
          , nested3: { doubleNested: 'double nested' }
        }
      };
      const stringToResolve = '${complex.nested} and ${complex.nested2} and ${complex.nested3} and ${complex.nested3.doubleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('nested value and nested value2 and  and double nested');
    });

    it('should substitute if complex nested field refers existent field', () => {
      const pageFormFields = { complex: { nested: { doubleNested: 'double nested' } } };
      const s = '${complex} and ${complex.nested} and ${complex.nested.} and ${complex.nested.double} and ${complex.nested.doubleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, s);

      expect(actual).toBe(' and  and  and  and double nested');
    });
  });

  describe('complex of collection of complex types', () => {
    it('should iterate collection items when resolving placeholders referring to collection items', () => {
      const pageFormFields = { topComplex: {
        field: 'value',
        collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested: 'nested value2', nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' }}}}}
      ]}};
      const stringToResolve = '${topComplex.field} and ${topComplex.collection.complex.nested} and ' +
        '${topComplex.collection.complex.nested2.doubleNested.trippleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(`value and nested value1 and tripple nested7
___
value and nested value2 and tripple nested8
___
value and nested value3 and tripple nested9`);
    });

    it('should iterate collection items when resolving placeholders referring to collection items with null values', () => {
      const pageFormFields = { topComplex: {
        field: 'value',
        collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' }}}}}
      ]}};
      const stringToResolve = '${topComplex.field} and ${topComplex.collection.complex.nested} and ' +
        '${topComplex.collection.complex.nested2.doubleNested.trippleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(`value and nested value1 and tripple nested7
___
value and  and tripple nested8
___
value and nested value3 and tripple nested9`);
    });

    it('should not resolve placeholders that do not point to a leaf value', () => {
      const pageFormFields = { topComplex: {
        collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested: 'nested value2', nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' }}}}}
      ]}};
      const stringToResolve = '${topComplex.collection.complex} and ${topComplex.collection.complex.nested2.doubleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(' and ');
    });
  });

  describe('collection types', () => {

    it('should substitute fields with text collection values', () => {
      const pageFormFields = { _1_one: [{ value: 'value1' }, { value: 'value2' }], _3_three: 'simpleValue' };
      const stringToResolve = '${_1_one} ${_3_three}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('value1, value2 simpleValue');
    });

    it('should substitute fields with number collection values', () => {
      const pageFormFields = { _1_one: [{ value: 35 }, { value: 45 }], _3_three: 'simpleValue' };
      const stringToResolve = '${_1_one} ${_3_three}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('35, 45 simpleValue');
    });

    it('should not substitute fields with complex collection values', () => {
      const pageFormFields = { _1_one: [{ value: { id: 'complex1' } }, { value: { id: 'complex2' } }], _3_three: 'simpleValue' };
      const stringToResolve = '${_1_one} ${_3_three}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(' simpleValue');
    });

    it('should not substitute fields with collection of collection values', () => {
      const pageFormFields = {
        _1_one: [{ value: [{ value: { id: 'complex1' } }] }, { value: [{ value: { id: 'complex2' } }] }],
        _3_three: 'simpleValue'
      };
      const stringToResolve = '${_1_one} ${_3_three}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(' simpleValue');
    });
  });

  describe('collection of complex types', () => {

    it('should iterate collection items when resolving placeholders referring to collection items', () => {
      const pageFormFields = { collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested: 'nested value2', nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' } }}}}
      ]};
      const stringToResolve = '${collection.complex.nested} and ${collection.complex.nested2.doubleNested.trippleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(`nested value1 and tripple nested7
___
nested value2 and tripple nested8
___
nested value3 and tripple nested9`);
    });

    it('should iterate collection items when resolving placeholders referring to collection items with null values', () => {
      const pageFormFields = { collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' } }}}}
      ]};
      const stringToResolve = '${collection.complex.nested} and ${collection.complex.nested2.doubleNested.trippleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(`nested value1 and tripple nested7
___
 and tripple nested8
___
nested value3 and tripple nested9`);
    });

    it('should not resolve placeholders that do not point to a leaf value', () => {
      const pageFormFields = { collection: [
        { value: {complex: {nested: 'nested value1', nested2: { doubleNested: {trippleNested: 'tripple nested7' }}}}},
        { value: {complex: {nested: 'nested value2', nested2: { doubleNested: {trippleNested: 'tripple nested8' }}}}},
        { value: {complex: {nested: 'nested value3', nested2: { doubleNested: {trippleNested: 'tripple nested9' } }}}}
      ]};
      const stringToResolve = '${collection.complex} and ${collection.complex.nested2.doubleNested}';

      const actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(' and ');
    });
  });
});
