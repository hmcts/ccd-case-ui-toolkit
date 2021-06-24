import { PlaceholderService } from '../../directives/substitutor/services/placeholder.service';
import { CaseField } from '../../domain';
import { FieldsUtils } from '../../services/fields/fields.utils';
import { CcdCaseTitlePipe } from './ccd-case-title.pipe';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';

describe('CcdCaseTitlePipe', () => {
  let ccdCaseTitle: CcdCaseTitlePipe;
  const placeholderService: PlaceholderService = new PlaceholderService();
  const fieldsUtils: FieldsUtils = new FieldsUtils();

  const caseFields: CaseField[] = [
    <CaseField>({
      id: 'FirstNameId',
      label: 'First name',
      value: 'John',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Text',
        type: 'Text'
      }
    }),
    <CaseField>({
      id: 'LastNameId',
      label: 'Last name',
      value: 'West',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Text',
        type: 'Text'
      }
    }),
    <CaseField>({
      id: 'Case_ReferenceId',
      label: 'Case_Reference',
      value: '123456',
      display_context: 'OPTIONAL',
      field_type: {
        id: 'Text',
        type: 'Text'
      }
    }),
  ];

  const FORM_GROUP = new FormGroup({
    data: new FormGroup({
      FirstNameId: new FormControl(),
      LastNameId: new FormControl(),
      Case_ReferenceId: new FormControl()
    })
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: PlaceholderService, useValue: placeholderService},
                  {provide: FieldsUtils, useValue: fieldsUtils}]
    });
    ccdCaseTitle = new CcdCaseTitlePipe(placeholderService, fieldsUtils);
  });

  it('should replace field interpolation and return actual value', () => {
    const title = '# ${Case_ReferenceId}: ${LastNameId}';
    expect(ccdCaseTitle.transform(title, caseFields, FORM_GROUP)).toBe('# 123456: West');
  });

  it('should replace field interpolation and return actual value', () => {
    const title = '# ${Case_ReferenceId}: ${FirstNameId}';
    expect(ccdCaseTitle.transform(title, caseFields, FORM_GROUP)).toBe('# 123456: John');
  });

});
