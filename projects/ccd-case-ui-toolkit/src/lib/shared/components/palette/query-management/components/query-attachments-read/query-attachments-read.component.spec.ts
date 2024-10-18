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

  it('should set the caseField\'s value (type FormDocument)', () => {
    component.attachments = [
      {
        document_url: 'http://localhost:3451/documents/123',
        document_binary_url: 'http://localhost:3451/documents/123/binary',
        document_filename: 'test.txt'
      },
      {
        document_url: 'http://localhost:3451/documents/another-test-file',
        document_binary_url: 'http://localhost:3451/documents/another-test-file/binary',
        document_filename: 'another-test-file.txt'
      }
    ];

    component.ngOnChanges();
    expect(component.caseFieldWithAttachments.value).toEqual(component.attachments);
  });
});
