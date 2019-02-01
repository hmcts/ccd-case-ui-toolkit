import { Field } from './field.model';
import { FieldType } from '../../../domain';
import { SearchInput } from './search-input.model';

export let createSearchInputs = () => {
  const fieldType = new FieldType();
  fieldType.id = 'Text';
  fieldType.type = 'Text';
  const searchInput1 = new SearchInput('Label 1', 1, new Field('PersonFirstName', fieldType));
  const searchInput2 = new SearchInput('Label 2', 2, new Field('PersonLastName', fieldType, '', '', true));
  return [searchInput1, searchInput2];
};
