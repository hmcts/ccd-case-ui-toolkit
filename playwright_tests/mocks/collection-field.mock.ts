import { CaseField, FieldType } from '../../projects/ccd-case-ui-toolkit/src/public-api';

const textFieldType = (): FieldType => Object.assign(new FieldType(), {
  id: 'Text',
  type: 'Text'
});

const collectionFieldType = (): FieldType => Object.assign(new FieldType(), {
  id: 'TextCollection',
  type: 'Collection',
  collection_field_type: textFieldType()
});

const createCollectionField = (id: string, label: string, displayContextParameter: string): CaseField =>
  Object.assign(new CaseField(), {
    id,
    label,
    display_context: 'OPTIONAL',
    display_context_parameter: displayContextParameter,
    value: [{ id: 'name-1', value: 'Alice' }],
    acls: [],
    field_type: collectionFieldType()
  });

export const collectionField = createCollectionField('names', 'Names', '#COLLECTION(allowInsert,allowDelete)');

export const restrictedCollectionField = createCollectionField('restrictedNames', 'Restricted names', '#COLLECTION()');
