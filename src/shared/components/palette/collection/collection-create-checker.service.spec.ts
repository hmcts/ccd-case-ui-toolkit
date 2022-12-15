import { TestBed } from '@angular/core/testing';
import { CollectionCreateCheckerService } from './collection-create-checker.service';
import { Profile } from '../../../domain/profile';
import { createACL, createCaseField, createFieldType, textFieldType } from '../../../fixture';
import { AccessControlList } from '../../../domain/definition/access-control-list.model';

describe('CollectionCreateCheckerService', () => {
  const ROLE1 = 'role1';
  const ROLE2 = 'role2';
  const ROLE3 = 'role3';
  let acl1: AccessControlList = createACL(ROLE1, true, true, true, false);
  let acl2: AccessControlList = createACL(ROLE2, true, true, false, false);
  let acl3: AccessControlList = createACL(ROLE3, false, true, false, false);

  let collectionCreateCheckerService: CollectionCreateCheckerService = new CollectionCreateCheckerService();
  const DATE_TEXT_FIELD = createCaseField('date', 'Date', '', textFieldType(), 'READONLY', undefined, undefined, [acl1, acl2]);
  DATE_TEXT_FIELD.display_context_parameter = '#COLLECTION(allowInsert)';
  const DESCRIPTION_TEXT_FIELD = createCaseField('description', 'Description', '', textFieldType(), 'READONLY',
    undefined, undefined, [acl3]);
  const CATEGORY_TEXT_FIELD = createCaseField('categoryText', 'Category name', '', textFieldType(),
    'READONLY', undefined, undefined, [acl1, acl2]);
  CATEGORY_TEXT_FIELD.display_context_parameter = '#COLLECTION(allowInsert)';
  const COLOR_TEXT_FIELD = createCaseField('colorText', 'Category', '', textFieldType(), 'READONLY', undefined, undefined, [acl1, acl2]);
  COLOR_TEXT_FIELD.display_context_parameter = '#COLLECTION(allowInsert)';
  const CATEGORY_COMPLEX_TYPE = createFieldType('TimelineEvent', 'Complex', [CATEGORY_TEXT_FIELD, COLOR_TEXT_FIELD]);
  const CATEGORY = createCaseField('categoy', 'Category', '', CATEGORY_COMPLEX_TYPE, 'READONLY', undefined, undefined, [acl1]);
  CATEGORY.display_context_parameter = '#COLLECTION(allowInsert)';
  const TAGS_COLLECTION = createCaseField('tags', 'Tags', '',
    createFieldType('tagss-bbcd64b3a', 'Collection', [], textFieldType()), 'READONLY',
    undefined, undefined, [acl1]);
  TAGS_COLLECTION.display_context_parameter = '#COLLECTION(allowInsert)';
  const TIMELINE_EVENT_COMPLEX = createFieldType('TimelineEvent', 'Complex',
    [DATE_TEXT_FIELD, DESCRIPTION_TEXT_FIELD, CATEGORY, TAGS_COLLECTION]);
  const TIMELINE_EVENTS_COLLECTION = createCaseField('defendantTimeLineEvents', 'Timeline Events', '',
    createFieldType('defendantTimeLineEvents-acd64b3a', 'Collection', [], TIMELINE_EVENT_COMPLEX), 'OPTIONAL',
    undefined, undefined, [acl2]);
  let rolesArray: Array<string> = [ROLE1, ROLE2, ROLE3];
  let profile: Profile = {
    user: {
      idam: {
        id: '21',
        email: 'a@b.com',
        forename: 'Jon',
        surname: 'Snow',
        roles: rolesArray
      }
    },
    channels: [],
    jurisdictions: [],
    default: {
      workbasket: {
        jurisdiction_id: '',
        case_type_id: '',
        state_id: ''
      }
    },
    isSolicitor(): boolean {
      return false;
    },
    isCourtAdmin(): boolean {
      return false;
    }
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: CollectionCreateCheckerService, useValue: collectionCreateCheckerService}]
    });
  });

  it('should be created with all the dependencies', () => {
    collectionCreateCheckerService.setDisplayContextForChildren(TIMELINE_EVENTS_COLLECTION, profile);
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[0].display_context).toEqual('OPTIONAL');
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[1].display_context).toEqual('READONLY');
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[2].display_context).toEqual('OPTIONAL');
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[2].field_type.complex_fields[0].display_context)
      .toEqual('OPTIONAL');
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[2].field_type.complex_fields[1].display_context)
      .toEqual('OPTIONAL');
    expect(TIMELINE_EVENTS_COLLECTION.field_type.collection_field_type.complex_fields[3].display_context).toEqual('OPTIONAL');
  });
});
