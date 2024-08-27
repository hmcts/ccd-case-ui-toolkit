import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Document, FormDocument } from '../../../../domain';
import { CaseMessage, QueryListItem } from '../models';

@Injectable()
export class QueryManagementUtils {
  public static extractCaseQueriesFromCaseField(): void {

  }

  public static documentToCollectionFormDocument(document: Document): { id: string; value: FormDocument } {
    return {
      id: null,
      value: {
        document_filename: document.originalDocumentName,
        document_url: document._links.self.href,
        document_binary_url: document._links.binary.href
      }
    };
  }

  public static getNewQueryData(formGroup: FormGroup, currentUserDetails: any): CaseMessage {
    const currentUserId = currentUserDetails?.uid;
    const currentUserName = currentUserDetails?.name;
    const id = currentUserDetails?.id;
    const subject = formGroup.get('subject').value;
    const body = formGroup.get('body').value;
    const isHearingRelated = formGroup.get('isHearingRelated').value;
    const hearingDate = (isHearingRelated as boolean)
      ? formGroup.get('hearingDate').value
      : null;
    const attachments = formGroup.get('attachments').value;
    return {
      id,
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
    const id = currentUserDetails?.id;
    const body = formGroup.get('body').value;
    const attachments = formGroup.get('attachments').value;
    return {
      id,
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
}
