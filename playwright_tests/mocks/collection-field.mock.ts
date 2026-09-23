export const collectionField = {
  id: 'names',
  label: 'Names',
  type: 'Collection',
  display_context: 'OPTIONAL',
  display_context_parameter: '#COLLECTION(allowInsert,allowDelete)',
  value: [{ id: 'name-1', value: 'Alice' }],
  acls: [],
  field_type: {
    id: 'TextCollection',
    type: 'Collection',
    collection_field_type: { id: 'Text', type: 'Text' }
  }
} as any;

export const restrictedCollectionField = {
  ...collectionField,
  id: 'restrictedNames',
  label: 'Restricted names',
  display_context_parameter: '#COLLECTION()'
};
