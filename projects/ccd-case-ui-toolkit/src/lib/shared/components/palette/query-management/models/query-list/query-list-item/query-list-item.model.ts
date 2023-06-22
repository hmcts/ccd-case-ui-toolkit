import { CaseField, Document, FieldType, FormDocument } from '../../../../../../domain';
import { PartyMessage } from '../../party-messages/party-message.model';

export class QueryListItem implements PartyMessage {
  public id: string;
  public subject?: string;
  public name: string;
  public body: string;
  public attachments?: Document[] = [];
  public isHearingRelated: boolean;
  public hearingDate?: string;
  public createdOn: Date;
  public createdBy: string;
  public parentId?: string;
  public children: QueryListItem[] = [];

  public get lastSubmittedMessage(): QueryListItem {
    const getLastSubmittedMessage = (item: QueryListItem): QueryListItem => {
      let lastSubmittedMessage: QueryListItem = item;

      if (item.children && item.children.length > 0) {
        for (const child of item.children) {
          const childLastSubmittedMessage = getLastSubmittedMessage(child);
          if (childLastSubmittedMessage.createdOn > lastSubmittedMessage.createdOn) {
            lastSubmittedMessage = childLastSubmittedMessage;
          }
        }
      }

      return lastSubmittedMessage;
    };

    return getLastSubmittedMessage(this);
  }

  public get lastSubmittedBy(): string {
    return this.lastSubmittedMessage.name;
  }

  public get lastSubmittedDate(): Date {
    return new Date(this.lastSubmittedMessage.createdOn);
  }

  public get lastResponseBy(): string {
    return this.children?.length > 0 ? this.lastSubmittedMessage.name : '';
  }

  public get lastResponseDate(): Date | null {
    return this.children?.length > 0 ? new Date(this.lastSubmittedMessage.createdOn) : null;
  }

  public get attachmentsForMockCaseField(): CaseField {
    const modifiedAttachments: { id: string; value: FormDocument }[] = this.attachments?.map((attachment: Document) => {
      return {
        id: '',
        value: {
          document_url: attachment._links.self.href,
          document_filename: attachment.originalDocumentName,
          document_binary_url: attachment._links.binary.href
        }
      };
    });

    return Object.assign(new CaseField(), {
      id: '',
      label: '',
      hint_text: '',
      field_type: Object.assign(new FieldType(), {
        id: this.id,
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
      value: modifiedAttachments
    });
  }
}
