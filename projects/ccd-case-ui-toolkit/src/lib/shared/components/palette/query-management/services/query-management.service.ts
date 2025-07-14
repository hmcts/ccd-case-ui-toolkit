import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { CaseField, CaseEventTrigger, CaseView } from '../../../../../../lib/shared/domain';
import { QmCaseQueriesCollection, QueryCreateContext, QueryListItem, CaseQueriesCollection } from '../models';
import { SessionStorageService } from '../../../../services';
import { USER_DETAILS } from '../../../../utils';
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
    const caseMessage = queryCreateContext === QueryCreateContext.NEW_QUERY
      ? QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails)
      : QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails);

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
    if (eventData?.case_fields?.length) {
      // Workaround for multiple qmCaseQueriesCollections that are not to be appearing in the eventData
      // Counts number qmCaseQueriesCollections
      const numberOfCaseQueriesCollections = eventData?.case_fields?.filter(
        (caseField) =>
          caseField.field_type.id === CASE_QUERIES_COLLECTION_ID &&
          caseField.field_type.type === FIELD_TYPE_COMPLEX && caseField.display_context !== DISPLAY_CONTEXT_READONLY
      )?.length || 0;

      this.caseQueriesCollections = eventData.case_fields.reduce((acc, caseField) => {
        // Extract the ID based on conditions, updating this.fieldId dynamically
        this.extractCaseQueryId(caseField, numberOfCaseQueriesCollections, queryCreateContext, eventData, caseDetails, messageId);

        const extractedCaseQueriesFromCaseField = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
        if (extractedCaseQueriesFromCaseField && typeof extractedCaseQueriesFromCaseField === 'object') {
          acc.push(extractedCaseQueriesFromCaseField);
        }

        return acc;
      }, []);
    }
  }

  private extractCaseQueryId(
    data: CaseField,
    count: number,
    context: QueryCreateContext,
    eventData: CaseEventTrigger,
    caseDetails: CaseView,
    messageId?:string): void {
    const { id, value } = data;
    // Check if the field_type matches CaseQueriesCollection and type is Complex
    if (data.field_type.id === CASE_QUERIES_COLLECTION_ID && data.field_type.type === FIELD_TYPE_COMPLEX) {
      if (this.isNewQueryContext(data, context)) {
        // If there is more than one qmCaseQueriesCollection, pick the one with the lowest order
        if (count > 1) {
          if (!this.handleMultipleCollections(caseDetails, eventData)) {
            return;
          }
        } else {
          // Set the field ID dynamically based on the extracted data
          this.fieldId = id; // Store the ID for use in generating newQueryData
        }
      }

      // If messageId is present, find the corresponding case message
      this.setMessageFieldId(messageId, value, id);
    }
  }

  private setMessageFieldId(messageId, value, id: string) {
    if (messageId && value?.caseMessages) {
      // If a matching message is found, set the fieldId to the corresponding id
      const matchedMessage = value?.caseMessages?.find((message) => message.value.id === messageId);
      if (matchedMessage) {
        this.fieldId = id;
      }
    }
  }

  private isNewQueryContext(data: CaseField, queryCreateContext: QueryCreateContext): boolean {
    return queryCreateContext === QueryCreateContext.NEW_QUERY && data.display_context !== DISPLAY_CONTEXT_READONLY;
  }

  private handleMultipleCollections(caseDetails:any, eventData: CaseEventTrigger): boolean {
    const jurisdictionId = caseDetails?.case_type?.jurisdiction?.id;

    if (!jurisdictionId) {
      console.error('Jurisdiction ID is missing.');
      return false;
    }

    if (this.getCollectionSelectionMethod(jurisdictionId) === QM_SELECT_FIRST_COLLECTION) {
      // Pick the collection with the lowest order
      this.fieldId = this.getCaseQueriesCollectionFieldOrderFromWizardPages(eventData)?.id;
    } else {
      // Display Error, for now, until EXUI-2644 is implemented
      console.error(`Error: Multiple CaseQueriesCollections are not supported yet for the ${jurisdictionId} jurisdiction`);
      return false;
    }

    return true;
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

