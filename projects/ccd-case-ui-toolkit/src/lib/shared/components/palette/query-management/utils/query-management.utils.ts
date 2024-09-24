import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Document, FormDocument, CaseField } from '../../../../domain';
import { CaseMessage, QueryListItem } from '../models';

@Injectable()
export class QueryManagementUtils {
  private static readonly caseLevelCaseFieldId = 'CaseQueriesCollection';
  public static readonly FIELD_TYPE_COLLECTION = 'Collection';
  public static readonly FIELD_TYPE_COMPLEX = 'Complex';

  public static extractCaseQueriesFromCaseField(caseField: CaseField, caseFieldId: string) {
    const { field_type, value } = caseField;
    // Handle Complex type fields
    if (field_type.type === QueryManagementUtils.FIELD_TYPE_COMPLEX) {
      if (field_type.id === QueryManagementUtils.caseLevelCaseFieldId && QueryManagementUtils.isNonEmptyObject(value)) {
        return value;
      }
      return null;
    }

    // Handle Collection type fields
    // if (field_type.type === QueryManagementUtils.FIELD_TYPE_COLLECTION) {
    //   return [];
    // }
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
    const currentUserId = currentUserDetails?.uid;
    const currentUserName = currentUserDetails?.name;
    const subject = formGroup.get('subject').value;
    const body = formGroup.get('body').value;
    const isHearingRelated = formGroup.get('isHearingRelated').value ? 'Yes' : 'No';
    const hearingDate = (isHearingRelated as string)
      ? formGroup.get('hearingDate').value
      : null;
    const attachments = formGroup.get('attachments').value;
    return {
      id: null,
      subject,
      name: currentUserName,
      body,
      attachments,
      isHearingRelated,
      hearingDate,
      createdOn: new Date(),
      createdBy: currentUserId
    };
  }

  public static getRespondOrFollowupQueryData(formGroup: FormGroup, queryItem: QueryListItem, currentUserDetails: any): CaseMessage {
    const currentUserId = currentUserDetails?.uid;
    const currentUserName = currentUserDetails?.name;
    const body = formGroup.get('body').value;
    const attachments = formGroup.get('attachments').value;
    queryItem.isHearingRelated = queryItem.isHearingRelated ? 'Yes' : 'No';

    return {
      id: null,
      subject: queryItem.subject,
      name: currentUserName,
      body,
      attachments,
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
}
