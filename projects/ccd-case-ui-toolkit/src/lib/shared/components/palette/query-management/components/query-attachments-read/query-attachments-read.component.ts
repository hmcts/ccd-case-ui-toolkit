import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { CaseField, Document, FieldType } from '../../../../../domain';
import { QueryManagementUtils } from '../../utils/query-management.utils';

@Component({
  selector: 'ccd-query-attachments-read',
  templateUrl: './query-attachments-read.component.html',
  styleUrls: ['./query-attachments-read.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class QueryAttachmentsReadComponent implements OnChanges {
  @Input() public attachments: Document[];
  public mockCaseFieldWithAttachments: CaseField;

  public ngOnChanges(): void {
    this.mockCaseFieldWithAttachments = Object.assign(new CaseField(), {
      id: '',
      label: '',
      hint_text: '',
      field_type: Object.assign(new FieldType(), {
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
      }),
      display_context_parameter: '#COLLECTION(allowInsert,allowUpdate)',
      value: []
    });

    this.mockCaseFieldWithAttachments.value = this.attachments ?
      this.attachments.map(QueryManagementUtils.documentToCollectionFormDocument) : [];
  }
}
