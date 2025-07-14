import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CaseField, CaseEventTrigger } from '../../../../domain';
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
  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public isNewQueryContext(context: QueryCreateContext, displayContext: string): boolean {
    return context === QueryCreateContext.NEW_QUERY && displayContext !== DISPLAY_CONTEXT_READONLY;
  }

  public getCaseQueriesCollectionFieldOrderFromWizardPages(eventData: CaseEventTrigger): CaseField | undefined {
    const candidateFields = eventData?.case_fields?.filter(
      (field) =>
        field.field_type.id === CASE_QUERIES_COLLECTION_ID &&
        field.field_type.type === FIELD_TYPE_COMPLEX &&
        field.display_context !== DISPLAY_CONTEXT_READONLY
    );

    const firstPageFields = eventData?.wizard_pages?.[0]?.wizard_page_fields;

    if (!candidateFields?.length || !firstPageFields) {
      return undefined;
    }

    return candidateFields
      .map((field) => {
        const wizardField = firstPageFields.find((f) => f.case_field_id === field.id);
        return { field, order: wizardField?.order ?? Number.MAX_SAFE_INTEGER };
      })
      .sort((a, b) => a.order - b.order)[0]?.field;
  }

  public getCollectionSelectionMethod(jurisdiction: string): string {
    return jurisdiction.toUpperCase() === CIVIL_JURISDICTION
      ? QM_SELECT_FIRST_COLLECTION
      : QM_COLLECTION_PROMPT;
  }

  public setCaseQueriesCollectionData(
    eventData: CaseEventTrigger,
    queryCreateContext: QueryCreateContext,
    caseDetails: any
  ): { fieldId: string, caseQueriesCollections: CaseQueriesCollection[] } {
    let fieldId: string = null;
    let caseQueriesCollections: CaseQueriesCollection[] = [];

    if (eventData?.case_fields?.length) {
      const numberOfCollections = eventData.case_fields.filter(
        (f) => f.field_type.id === CASE_QUERIES_COLLECTION_ID &&
             f.field_type.type === FIELD_TYPE_COMPLEX &&
             f.display_context !== DISPLAY_CONTEXT_READONLY
      ).length;

      caseQueriesCollections = eventData.case_fields.reduce((acc, caseField) => {
        const { extractedId, skip } = this.extractCaseQueryId(caseField, numberOfCollections, queryCreateContext, eventData, caseDetails);
        if (extractedId && !skip) {
          fieldId = extractedId;
        }

        const extracted = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
        if (extracted && typeof extracted === 'object') {
          acc.push(extracted);
        }
        return acc;
      }, []);
    }

    return { fieldId, caseQueriesCollections };
  }

  private extractCaseQueryId(
    data: CaseField,
    count: number,
    context: QueryCreateContext,
    eventData: CaseEventTrigger,
    caseDetails: any
  ): { extractedId: string, skip: boolean } {
    const { id, value } = data;
    const messageId = this.route.snapshot.params.dataid;

    if (data.field_type.id !== CASE_QUERIES_COLLECTION_ID || data.field_type.type !== FIELD_TYPE_COMPLEX) {
      return { extractedId: null, skip: true };
    }

    if (this.isNewQueryContext(context, data.display_context)) {
      if (count > 1) {
        const jurisdictionId = caseDetails?.case_type?.jurisdiction?.id;
        if (!jurisdictionId) {
          console.error('Jurisdiction ID is missing.');
          return { extractedId: null, skip: true };
        }

        if (this.getCollectionSelectionMethod(jurisdictionId) === QM_SELECT_FIRST_COLLECTION) {
          const orderedField = this.getCaseQueriesCollectionFieldOrderFromWizardPages(eventData);
          return { extractedId: orderedField?.id, skip: !orderedField };
        }
        console.error(`Error: Multiple CaseQueriesCollections are not supported yet for the ${jurisdictionId} jurisdiction`);
        return { extractedId: null, skip: true };
      }
      return { extractedId: id, skip: false };
    }

    if (messageId && value?.caseMessages) {
      const matchedMessage = value.caseMessages.find((msg) => msg.value.id === messageId);
      if (matchedMessage) {
        return { extractedId: id, skip: false };
      }
    }

    return { extractedId: null, skip: true };
  }

  public generateCaseQueriesCollectionData(
    formGroup: FormGroup,
    fieldId: string,
    caseQueriesCollections: CaseQueriesCollection[],
    queryCreateContext: QueryCreateContext,
    queryItem: QueryListItem
  ): QmCaseQueriesCollection {
    const currentUserDetails = JSON.parse(this.sessionStorageService.getItem(USER_DETAILS));
    const caseMessage = queryCreateContext === QueryCreateContext.NEW_QUERY
      ? QueryManagementUtils.getNewQueryData(formGroup, currentUserDetails)
      : QueryManagementUtils.getRespondOrFollowupQueryData(formGroup, queryItem, currentUserDetails);

    const messageId = this.route.snapshot.params.dataid;
    const isNewQuery = queryCreateContext === QueryCreateContext.NEW_QUERY;

    if (!fieldId) {
      console.error('Error: Field ID for CaseQueriesCollection not found. Cannot proceed with data generation.');
      this.router.navigate(['/', 'service-down']);
    }

    const newQueryData: QmCaseQueriesCollection = {};

    if (caseQueriesCollections?.length) {
      let matchedCollection;

      if (!isNewQuery && messageId) {
        matchedCollection = caseQueriesCollections.find((collection) =>
          collection.caseMessages.some((message) => message.value.id === messageId)
        );
      }

      if (matchedCollection) {
        matchedCollection.caseMessages.push({ id: null, value: caseMessage });
        newQueryData[fieldId] = {
          ...matchedCollection,
          caseMessages: [...matchedCollection.caseMessages]
        };
      } else {
        const originalPartyName = caseQueriesCollections[0].partyName;
        newQueryData[fieldId] = {
          partyName: originalPartyName,
          roleOnCase: '',
          caseMessages: [
            { id: null, value: caseMessage },
            ...caseQueriesCollections.flatMap((collection) => collection.caseMessages)
          ]
        };
      }
    } else {
      newQueryData[fieldId] = {
        partyName: currentUserDetails?.name || `${currentUserDetails?.forename} ${currentUserDetails?.surname}`,
        roleOnCase: '',
        caseMessages: [
          { id: null, value: caseMessage }
        ]
      };
    }

    return newQueryData;
  }
}
