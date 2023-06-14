import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CaseField, Document, FormDocument } from '../../../../../../domain';
import { QueryWriteAddDocumentsComponent } from './query-write-add-documents.component';

describe('QueryWriteAddDocumentsComponent', () => {
  let component: QueryWriteAddDocumentsComponent;
  let fixture: ComponentFixture<QueryWriteAddDocumentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryWriteAddDocumentsComponent ],
      imports: [ ReactiveFormsModule ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryWriteAddDocumentsComponent);
    component = fixture.componentInstance;
    // setting a mock FormArray -- child component (i.e. write-collection-field) does it on ngOnInit
    component.documentFormGroup.addControl(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME,
      new FormArray([]));
    component.formGroup = new FormGroup({
      attachments: new FormControl([])
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add the mock case field', () => {
    expect(component.mockDocumentCaseField).toEqual(jasmine.any(CaseField));
    expect(component.mockDocumentCaseField.id).toEqual(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME);
  });

  describe('ngOnInit', () => {
    it('should set the mockDocumentCaseField value (type FormDocument) off the formGroup\'s attachments value (type Document)', () => {
      const documents: Document[] = [
        {
          originalDocumentName: 'test.txt',
          _links: {
            self: {
              href: 'http://localhost:3451/documents/123'
            },
            binary: {
              href: 'http://localhost:3451/documents/123/binary'
            }
          }
        }
      ];
      const formDocuments: { id: string; value: FormDocument }[] = [
        {
          id: null,
          value: {
            document_filename: 'test.txt',
            document_url: 'http://localhost:3451/documents/123',
            document_binary_url: 'http://localhost:3451/documents/123/binary'
          }
        }
      ];

      component.formGroup.get('attachments').setValue(documents);
      component.ngOnInit();
      expect(component.mockDocumentCaseField.value).toEqual(formDocuments);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from documentFormControlSubscription', () => {
      // @ts-expect-error private property
      const spyOnSubscription = spyOn(component.documentFormControlSubscription, 'unsubscribe');

      expect(spyOnSubscription).not.toHaveBeenCalled();
      component.ngOnDestroy();
      expect(spyOnSubscription).toHaveBeenCalled();
    });
  });

  describe('documentCollectionUpdate', () => {
    let spyOnEmit: jasmine.Spy;
    beforeEach(() => {
      spyOnEmit = spyOn(component.documentCollectionUpdate, 'emit');

      // mock the fields set by the child component (i.e. write-collection-field)
      // when clicking 'Add new' twice
      const formArray = (component.documentFormGroup
        .get(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME) as FormArray);

      formArray.push(new FormControl({ id: null, value: { document_filename: null, document_url: null,  document_binary_url: null } }));
      formArray.push(new FormControl({ id: null, value: { document_filename: null, document_url: null,  document_binary_url: null } }));
    });

    it('should emit but filter the entries where the value is null (i.e. not file has been uploaded)', () => {
      const documents = [
        {
          id: '1',
          value: {
            document_url: null,
            document_binary_url: null,
            document_filename: null,
          }
        },
        {
          id: '2',
          value: {
            document_url: 'document_url_2',
            document_binary_url: 'document_binary_url_2',
            document_filename: 'document_filename_2',
          }
        }
      ];
      component.documentFormGroup
        .get(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME)
        .setValue(documents);

      expect(spyOnEmit).toHaveBeenCalledWith([documents[1].value]);
    });

    it('should emit the value of each document entry on the formControl valueChanges', () => {
      const documents = [
        {
          id: '1',
          value: {
            document_url: 'document_url_1',
            document_binary_url: 'document_binary_url_1',
            document_filename: 'document_filename_1',
          }
        },
        {
          id: '2',
          value: {
            document_url: 'document_url_2',
            document_binary_url: 'document_binary_url_2',
            document_filename: 'document_filename_2',
          }
        }
      ];
      component.documentFormGroup
        .get(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME)
        .setValue(documents);

      expect(spyOnEmit).toHaveBeenCalledWith(
        documents.map(document => document.value)
      );
    });
  });
});
