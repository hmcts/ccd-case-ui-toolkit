import { PlaceholderService } from './placeholder.service';

describe('PlaceholderService', () => {

  let placeholderService: PlaceholderService;
  beforeEach(() => {
    placeholderService = new PlaceholderService();
  });

  describe('simple types', () => {

    it('should not substitute if no page form fields', () => {
      let pageFormFields = [{}];
      let stringToResolve = 'Email for ${PersonFirstName} is';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe(stringToResolve);
    });

    it('should not substitute if stringToResolve is null', () => {
      let pageFormFields = [{ 'PersonFirstName': 'John' }];
      let stringToResolve = null;

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBeNull();
    });

    it('should substitute with empty value if page form field is matched and has null value', () => {
      let pageFormFields = { 'PersonFirstName': null };
      let stringToResolve = 'Email for ${PersonFirstName} is';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for  is');
    });

    it('should substitute with empty value if page form field is matched and has empty value', () => {
      let pageFormFields = { 'PersonFirstName': '' };
      let stringToResolve = 'Email for ${PersonFirstName} is';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for  is');
    });

    it('should substitute with value if page form field is matched and has value', () => {
      let pageFormFields = { 'Age': 34, 'PersonFirstName': 'John' };
      let stringToResolve = 'Email for ${PersonFirstName} of ${Age} is';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for John of 34 is');
    });

    it('should substitute with multiple values multiple times if page form field is matched and has value', () => {
      let pageFormFields = { 'PersonFirstName': 'John', 'PersonLastName': 'Smith' };
      let stringToResolve = 'Email for ${PersonFirstName} ${PersonLastName} is ${PersonFirstName}.${PersonLastName}@gmail.com';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('Email for John Smith is John.Smith@gmail.com');
    });

    it('should only substitute with the values that are matched from page form fields', () => {
      let pageFormFields = { 'Age': null, 'Markdownlabel': null, 'PersonAddress': {}, 'D8Document': 'photo.jpg' };
      let stringToResolve = `First Name is \${Age} years old \${Age} \
and markdown is \${Markdownlabel} and address is \${Address} and document \${D8Document}`;

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('First Name is  years old  and markdown is  and address is ${Address} and document photo.jpg');
    });

    it('should not substitute fields ids with special characters but _', () => {
      let pageFormFields = { '_1': 'one', '%2': 'two', '?3': { 'field': 'value' }, '$4': 'four', '_5': 'five' };
      let stringToResolve = '${_1} ${%2} ${?3} ${$4} {_5}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('one ${%2} ${?3} ${$4} {_5}');
    });

    it('should not substitute nested fields', () => {
      let pageFormFields = { '_1': 'one' };
      let stringToResolve = 'This ${_1} but not this ${${_1}} and not this ${field${_1}field} but this ${_1} too';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('This one but not this ${${_1}} and not this ${field${_1}field} but this one too');
    });

    it('should not substitute if value of a field to substitute refers itself', () => {
      let pageFormFields = { '_1_one': '${_1_one}' };
      let stringToResolve = '${_1_one}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('${_1_one}');
    });

    it('should substitute fields with multi select values', () => {
      let pageFormFields = { '_1_one': ['code1', 'code2'], '_1_one-LABEL': ['label1', 'label2'], '_3_three': 'simpleValue' };
      let stringToResolve = '${_1_one} ${_3_three}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('label1, label2 simpleValue');
    });
  });

  describe('complex types', () => {

    it('should substitute complex nested field with simple type leaf value', () => {
      let pageFormFields = {
        'complex': {
          'nested': 'nested value', 'nested2': 'nested value2'
          , 'nested3': { 'doubleNested': 'double nested' }
        }
      };
      let stringToResolve = '${complex.nested} and ${complex.nested2} and ${complex.nested3} and ${complex.nested3.doubleNested}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('nested value and nested value2 and ${complex.nested3} and double nested');
    });

    it('should substitute if complex nested field refers existent field', () => {
      let pageFormFields = { 'complex': { 'nested': { 'doubleNested': 'double nested' } } };
      let s = '${complex} and ${complex.nested} and ${complex.nested.} and ${complex.nested.double} and ${complex.nested.doubleNested}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, s);

      expect(actual).toBe('${complex} and ${complex.nested} and ${complex.nested.} and ${complex.nested.double} and double nested');
    });
  });

  describe('collection types', () => {

    it('should substitute fields with text collection values', () => {
      let pageFormFields = { '_1_one': [{ 'value': 'value1' }, { 'value': 'value2' }], '_3_three': 'simpleValue' };
      let stringToResolve = '${_1_one} ${_3_three}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('value1, value2 simpleValue');
    });

    it('should substitute fields with number collection values', () => {
      let pageFormFields = { '_1_one': [{ 'value': 35 }, { 'value': 45 }], '_3_three': 'simpleValue' };
      let stringToResolve = '${_1_one} ${_3_three}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('35, 45 simpleValue');
    });

    it('should not substitute fields with complex collection values', () => {
      let pageFormFields = { '_1_one': [{ 'value': { 'id': 'complex1' } }, { 'value': { 'id': 'complex2' } }], '_3_three': 'simpleValue' };
      let stringToResolve = '${_1_one} ${_3_three}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('${_1_one} simpleValue');
    });

    it('should not substitute fields with collection of collection values', () => {
      let pageFormFields = {
        '_1_one': [{ 'value': [{ 'value': { 'id': 'complex1' } }] }, { 'value': [{ 'value': { 'id': 'complex2' } }] }],
        '_3_three': 'simpleValue'
      };
      let stringToResolve = '${_1_one} ${_3_three}';

      let actual = placeholderService.resolvePlaceholders(pageFormFields, stringToResolve);

      expect(actual).toBe('${_1_one} simpleValue');
    });
  });
});
