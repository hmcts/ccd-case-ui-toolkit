import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CaseField, FieldType } from '../../../../../../domain';

@Component({
  selector: 'ccd-query-write-add-documents',
  templateUrl: './query-write-add-documents.component.html',
  styleUrls: ['./query-write-add-documents.component.scss']
})
export class QueryWriteAddDocumentsComponent implements OnInit {
  @Input() public formGroup: FormGroup;
  @Input() public queryId: string;
  public mockDocumentCaseField: CaseField;
  constructor() {
    this.mockDocumentCaseField = new CaseField();
    this.mockDocumentCaseField.id = `QueryDocuments_${this.queryId}`;
    this.mockDocumentCaseField.label = 'Add document (optional)';
    this.mockDocumentCaseField.hint_text = 'Attach a document to this message';
    this.mockDocumentCaseField.field_type = Object.assign(new FieldType(), {
      id: 'QueryDocuments',
      type: 'QueryDocuments',
      min: null,
      max: null,
      regular_expression: null,
      fixed_list_items: [],
      complex_fields: [],
      collection_field_type: Object.assign(new FieldType(), {
          id: 'Document',
          type: 'Document',
          min: null,
          max: null,
          regular_expression: null,
          fixed_list_items: [],
          complex_fields: [],
          collection_field_type: null
      })
    });
    this.mockDocumentCaseField.display_context_parameter = '#COLLECTION(allowInsert,allowUpdate)';
  }

  public ngOnInit(): void {}
}
