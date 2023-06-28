import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CaseField, FormDocument } from '../../../../../domain';
import { QueryAttachmentsReadComponent } from './query-attachments-read.component';

describe('QueryAttachmentsReadComponent', () => {
  let component: QueryAttachmentsReadComponent;
  let fixture: ComponentFixture<QueryAttachmentsReadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QueryAttachmentsReadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryAttachmentsReadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set the mock case field with collection_field_type type Document', () => {
    component.ngOnChanges();
    expect(component.mockCaseFieldWithAttachments).toEqual(jasmine.any(CaseField));
    expect(component.mockCaseFieldWithAttachments.field_type.collection_field_type.type).toBe('Document');
  });

  it('should set the caseField\'s value (type FormDocument) off the Input attachments value (type Document)', () => {
    component.attachments = [
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
      },
      {
        originalDocumentName: 'another-test-file.txt',
        _links: {
          self: {
            href: 'http://localhost:3451/documents/another-test-file'
          },
          binary: {
            href: 'http://localhost:3451/documents/another-test-file/binary'
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
      },
      {
        id: null,
        value: {
          document_filename: 'another-test-file.txt',
          document_url: 'http://localhost:3451/documents/another-test-file',
          document_binary_url: 'http://localhost:3451/documents/another-test-file/binary'
        }
      }
    ];

    component.ngOnChanges();
    expect(component.mockCaseFieldWithAttachments.value).toEqual(formDocuments);
  });
});
