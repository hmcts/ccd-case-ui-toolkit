import { AfterViewInit, Component, EventEmitter, OnDestroy, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CaseField, FieldType, FormDocument } from '../../../../../../domain';

@Component({
  selector: 'ccd-query-write-add-documents',
  templateUrl: './query-write-add-documents.component.html'
})
export class QueryWriteAddDocumentsComponent implements AfterViewInit, OnDestroy {
  public static DOCUMENTS_FORM_CONTROL_NAME = 'documentCollection';
  public documentFormGroup = new FormGroup({});
  public mockDocumentCaseField: CaseField;
  private documentFormControlSubscription: Subscription;

  @Output() public documentCollectionUpdate =  new EventEmitter<FormDocument[]>();

  constructor() {
    // This field is mocked to allow the document component to be used in isolation
    this.mockDocumentCaseField = Object.assign(new CaseField(), {
      id: QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME,
      label: 'Add document (optional)',
      hint_text: 'Attach a document to this message',
      display_context_parameter: '#COLLECTION(allowInsert,allowUpdate)',
      field_type: Object.assign(new FieldType(), {
        id: 'queryDocuments',
        type: 'queryDocuments',
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
          collection_field_type: null,
        })
      }),
    });
  }

  public ngAfterViewInit(): void {
    const formControl = this.documentFormGroup.get(QueryWriteAddDocumentsComponent.DOCUMENTS_FORM_CONTROL_NAME);
    if (formControl) {
      this.documentFormControlSubscription = (formControl.valueChanges as Observable<{ id: string, value: FormDocument}[]>)
        .pipe(
          map(documents => (
            documents.filter((document) => !!document?.value?.document_url))
          ),
          map(documents => documents.map(document => document?.value)),
          tap(documents => this.documentCollectionUpdate.emit(documents)),
        )
        .subscribe();
    }
  }

  public ngOnDestroy(): void {
    this.documentFormControlSubscription?.unsubscribe();
  }
}
