import { FieldType } from '../../../domain/definition/field-type.model';
import { Field } from '../../../domain/search/field.model';
import { SearchInput } from './search-input.model';

export let createSearchInputs = () => {
  const fieldType = new FieldType();
  fieldType.id = 'Text';
  fieldType.type = 'Text';
  const complexFieldType = new FieldType();
  fieldType.id = 'AddressUK';
  fieldType.type = 'Complex';
  const searchInput1 = new SearchInput('Label 1', 1, new Field('PersonFirstName', fieldType));
  const searchInput2 = new SearchInput('Label 2', 2, new Field('PersonLastName', fieldType, '', '', '', true));
  const searchInput3 = new SearchInput('Label 3', 3, new Field('PersonAddress', complexFieldType, 'Country'));
  return [searchInput1, searchInput2, searchInput3];
};
