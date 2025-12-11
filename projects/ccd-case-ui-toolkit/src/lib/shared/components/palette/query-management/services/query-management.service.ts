import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CaseField, CaseEventTrigger, CaseView } from '../../../../../../lib/shared/domain';
import { QmCaseQueriesCollection, QueryCreateContext, QueryListItem, CaseQueriesCollection } from '../models';
import { SessionStorageService } from '../../../../services';
import { isInternalUser, isJudiciaryUser, USER_DETAILS } from '../../../../utils';
import { QueryManagementUtils } from '../utils/query-management.utils';
import {
  CASE_QUERIES_COLLECTION_ID,
  FIELD_TYPE_COMPLEX,
  DISPLAY_CONTEXT_READONLY,
  QM_SELECT_FIRST_COLLECTION,
  QM_COLLECTION_PROMPT,
  CIVIL_JURISDICTION
} from '../constants/query-management.constants';
import { FormGroup } from '@angular/forms';

@Injectable({ providedIn: 'root' })

export class QueryManagementService {
  public caseQueriesCollections: CaseQueriesCollection[];
  public fieldId: string;

  constructor(
    private readonly router: Router,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public isInternalUser(): boolean {
    return isInternalUser(this.sessionStorageService);
  }

  public isJudiciaryUser(): boolean {
    return isJudiciaryUser(this.sessionStorageService);
  }

  public generateCaseQueriesCollectionData(
    formGroup: FormGroup,
    queryCreateContext: QueryCreateContext,
    queryItem: QueryListItem,
    messageId?: string // Get the message ID from route params (if present)
  ): QmCaseQueriesCollection {
    let currentUserDetails;

    try {
      currentUserDetails = JSON.parse(this.sessionStorageService.getItem(USER_DETAILS));
    } catch (e) {
      console.error('Could not parse USER_DETAILS from session storage:', e);
      currentUserDetails = {};
    }

    const isHmctsStaff= (this.isJudiciaryUser() || this.isInternalUser()) ? 'Yes' : 'No';
    const caseMessage = queryCreateContext === QueryCreateContext.NEW_QUERY
      ? QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails, isHmctsStaff)
      : QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails, queryCreateContext);

    const isNewQuery = queryCreateContext === QueryCreateContext.NEW_QUERY; // Check if this is a new query

    // Check if the field ID has been set dynamically
    if (!this.fieldId) {
      console.error('Error: Field ID for CaseQueriesCollection not found. Cannot proceed with data generation.');
      this.router.navigate(['/', 'service-down']);
      throw new Error('Field ID for CaseQueriesCollection not found. Aborting query data generation.');
    }

    // Initialize new query data structure
    const newQueryData: QmCaseQueriesCollection = {};

    if (this.caseQueriesCollections?.length) {
      let matchedCollection;

      // If it's not a new query, try to find the existing collection with the message ID
      if (!isNewQuery && messageId) {
        matchedCollection = this.caseQueriesCollections.find((collection) =>
          collection.caseMessages.some((message) => message.value.id === messageId)
        );
      }

      if (matchedCollection) {
        // Append the new case message to the matched collection's caseMessages
        matchedCollection.caseMessages.push({
          id: null,
          value: caseMessage
        });

        // Add the matched collection to newQueryData
        newQueryData[this.fieldId] = {
          ...matchedCollection, // Keep existing data intact
          caseMessages: [...matchedCollection.caseMessages] // Append the updated messages array
        };
      } else {
        // Use partyName from the first collection (assumption: all share the same party)
        const originalPartyName = this.caseQueriesCollections?.[0]?.partyName ?? currentUserDetails?.name;

        // If no collection matches, or it's a new query
        newQueryData[this.fieldId] = {
          partyName: originalPartyName,
          roleOnCase: '', // Not returned by CCD
          caseMessages: [
            {
              id: null,
              value: caseMessage
            }
          ]
        };

        // If caseQueriesCollections is not empty, append its data
        newQueryData[this.fieldId].caseMessages.push(
          ...this.caseQueriesCollections.flatMap((collection) => collection.caseMessages)
        );
      }
    } else {
      // If there are no existing collections, create a new one (e.g., for new queries)
      newQueryData[this.fieldId] = {
        partyName: currentUserDetails?.name || `${currentUserDetails?.forename} ${currentUserDetails?.surname}`, // Not returned by CCD
        roleOnCase: '', // Not returned by CCD
        caseMessages: [
          {
            id: null,
            value: caseMessage
          }
        ]
      };
    }
    return newQueryData;
  }

  public setCaseQueriesCollectionData(
    eventData: CaseEventTrigger,
    queryCreateContext: QueryCreateContext,
    caseDetails: CaseView,
    messageId?: string
  ): void {
    const resolvedFieldId = this.resolveFieldId(eventData, queryCreateContext, caseDetails, messageId);

    if (!resolvedFieldId) {
      console.error('Failed to resolve fieldId for CaseQueriesCollection. Cannot proceed.');
      return;
    }

    this.fieldId = resolvedFieldId;

    this.caseQueriesCollections = eventData.case_fields.reduce((acc, field) => {
      if (field.id === this.fieldId) {
        const extracted = QueryManagementUtils.extractCaseQueriesFromCaseField(field);
        if (extracted && typeof extracted === 'object') {
          acc.push(extracted);
        }
      }
      return acc;
    }, []);
  }

  private resolveFieldId(
    eventData: CaseEventTrigger,
    queryCreateContext: QueryCreateContext,
    caseDetails: CaseView,
    messageId?: string
  ): string | null {
  // Step 1: Filter candidate fields (must be editable CaseQueriesCollection fields)
    const candidateFields = eventData?.case_fields?.filter(
      (field) =>
        field.field_type.id === CASE_QUERIES_COLLECTION_ID &&
      field.field_type.type === FIELD_TYPE_COMPLEX &&
      field.display_context !== DISPLAY_CONTEXT_READONLY
    );

    if (!candidateFields?.length) {
      console.warn('No editable CaseQueriesCollection fields found.');
      return null;
    }

    const numberOfCollections = candidateFields.length;
    const jurisdictionId = caseDetails?.case_type?.jurisdiction?.id ?? '';

    // Step 2: If messageId is present, try to locate the field containing that message
    if (messageId) {
      const fieldByMessage = candidateFields.find((field) =>
        field?.value?.caseMessages?.some((msg) => msg?.value?.id === messageId)
      );
      if (fieldByMessage) {
        return fieldByMessage.id; // Found the matching field by message ID
      }
    }

    // Step 3: Handle new queries
    if (queryCreateContext === QueryCreateContext.NEW_QUERY) {
    // If there's only one collection, use it
      if (numberOfCollections === 1) {
        return candidateFields[0].id;
      }

      // For multiple collections, use jurisdiction-based resolution strategy
      if (this.getCollectionSelectionMethod(jurisdictionId) === QM_SELECT_FIRST_COLLECTION) {
      // Choose the one with the lowest order from the first wizard page
        const firstOrdered = this.getCaseQueriesCollectionFieldOrderFromWizardPages(eventData);
        if (firstOrdered) {
          return firstOrdered.id;
        }
      } else {
        console.error(`Error: Multiple CaseQueriesCollections are not supported yet for the ${jurisdictionId} jurisdiction`);
        return null;
      }
    }

    // Step 4: Fallback — if none of the above succeeded
    console.warn('Could not determine fieldId for context:', queryCreateContext);
    return null;
  }

  private getCaseQueriesCollectionFieldOrderFromWizardPages(eventData: CaseEventTrigger): CaseField | undefined {
    const candidateFields = eventData?.case_fields?.filter(
      (field) =>
        field.field_type.id === CASE_QUERIES_COLLECTION_ID &&
        field.field_type.type === FIELD_TYPE_COMPLEX &&
        field.display_context !== DISPLAY_CONTEXT_READONLY
    );

    if (!candidateFields?.length) {
      return undefined;
    }

    const firstPageFields = eventData?.wizard_pages?.[0]?.wizard_page_fields;

    if (!firstPageFields) {
      return undefined;
    }

    return candidateFields
      .map((field) => {
        const wizardField = firstPageFields.find((f) => f.case_field_id === field.id);
        return { field, order: wizardField?.order ?? Number.MAX_SAFE_INTEGER };
      })
      .sort((a, b) => a.order - b.order)[0]?.field;
  }

  private getCollectionSelectionMethod(jurisdiction: string): string {
    return jurisdiction.toUpperCase() === CIVIL_JURISDICTION ? QM_SELECT_FIRST_COLLECTION : QM_COLLECTION_PROMPT;
  }
}

