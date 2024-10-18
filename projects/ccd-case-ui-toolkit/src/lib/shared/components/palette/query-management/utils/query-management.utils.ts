import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Document, FormDocument, CaseField } from '../../../../domain';
import { CaseMessage, QueryListItem } from '../models';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

@Injectable()
export class QueryManagementUtils {
  private static readonly caseLevelCaseFieldId = 'CaseQueriesCollection';
  public static readonly FIELD_TYPE_COLLECTION = 'Collection';
  public static readonly FIELD_TYPE_COMPLEX = 'Complex';

  public static extractCaseQueriesFromCaseField(caseField: CaseField) {
    const { field_type, value } = caseField;

    // Handle Complex type fields
    if (field_type.type === QueryManagementUtils.FIELD_TYPE_COMPLEX) {
      if (field_type.id === QueryManagementUtils.caseLevelCaseFieldId && QueryManagementUtils.isNonEmptyObject(value)) {
        return value;
      }
      return null;
    }
  }

  public static documentToCollectionFormDocument(document: Document): { id: string; value: FormDocument } {
    return {
      id: null,
      value: {
        document_filename: document?.originalDocumentName,
        document_url: document?._links?.self?.href,
        document_binary_url: document?._links?.binary?.href
      }
    };
  }

  public static getNewQueryData(formGroup: FormGroup, currentUserDetails: any): CaseMessage {
    const attachments = formGroup.get('attachments').value;
    const formDocument = attachments.map((document) => this.documentToCollectionFormDocument(document));
    const currentUserId = currentUserDetails?.uid || currentUserDetails?.id;
    const currentUserName = currentUserDetails?.name || `${currentUserDetails?.forename} ${currentUserDetails?.surname}`;
    const subject = formGroup.get('subject').value;
    const body = formGroup.get('body').value;
    const isHearingRelated = formGroup.get('isHearingRelated').value ? 'Yes' : 'No';
    const hearingDate = (isHearingRelated === 'Yes')
      ? this.formattedDate(formGroup.get('hearingDate').value)
      : null;
    return {
      id: uuidv4(),
      subject,
      name: currentUserName,
      body,
      attachments: formDocument,
      isHearingRelated,
      hearingDate,
      createdOn: new Date(),
      createdBy: currentUserId
    };
  }

  public static getRespondOrFollowupQueryData(formGroup: FormGroup, queryItem: QueryListItem, currentUserDetails: any): CaseMessage {
    const currentUserId = currentUserDetails?.uid || currentUserDetails?.id;
    const currentUserName = currentUserDetails?.name || `${currentUserDetails?.forename} ${currentUserDetails?.surname}`;
    const body = formGroup.get('body').value;
    const attachments = formGroup.get('attachments').value;
    const formDocument = attachments.map((document) => this.documentToCollectionFormDocument(document));
    queryItem.isHearingRelated = queryItem.isHearingRelated ? 'Yes' : 'No';

    return {
      id: uuidv4(),
      subject: queryItem.subject,
      name: currentUserName,
      body,
      attachments: formDocument,
      isHearingRelated: queryItem.isHearingRelated,
      hearingDate: queryItem.hearingDate,
      createdOn: new Date(),
      createdBy: currentUserId,
      parentId: queryItem.id
    };
  }

  public static isObject(elem: any): boolean {
    return typeof elem === 'object' && elem !== null;
  }

  public static isNonEmptyObject(elem: any): boolean {
    return this.isObject(elem) && Object.keys(elem).length !== 0;
  }

  private static formattedDate(date): string {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    return formattedDate;
  }
}
