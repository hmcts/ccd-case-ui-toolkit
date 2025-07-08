import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { RaiseQueryErrorMessage } from '../../../enums';
import {
  CaseEventData,
  CaseEventTrigger,
  CaseField
} from '../../../../../../../../lib/shared/domain';
import { Observable } from 'rxjs';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../../models';
import { SessionStorageService } from '../../../../../../services';
import { USER_DETAILS } from '../../../../../../utils';
import { QueryManagementUtils } from '../../../utils/query-management.utils';
import { ActivatedRoute, Router } from '@angular/router';
import { EventCompletionParams } from '../../../../../case-editor/domain/event-completion-params.model';

@Component({
  selector: 'ccd-query-write-raise-query',
  templateUrl: './query-write-raise-query.component.html'
})
export class QueryWriteRaiseQueryComponent implements OnChanges {
  @Input() public formGroup: FormGroup;
  @Input() public submitted: boolean;
  @Input() public caseDetails;
  @Input() public showForm: boolean;
  @Input() public serviceMessage: string | null;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public eventData: CaseEventTrigger | null = null;
  @Input() public queryItem: QueryListItem;
  @Input()
  public validate: (caseEventData: CaseEventData, pageId: string) => Observable<object>;

  @Output() public queryDataCreated = new EventEmitter <QmCaseQueriesCollection>();
  @Input() public triggerSubmission: boolean;
  public raiseQueryErrorMessage = RaiseQueryErrorMessage;
  public fieldId: string;
  public caseQueriesCollections: CaseQueriesCollection[];

  private readonly CASE_QUERIES_COLLECTION_ID = 'CaseQueriesCollection';
  public readonly FIELD_TYPE_COMPLEX = 'Complex';
  public readonly DISPLAY_CONTEXT_READONLY = 'READONLY';
  public readonly QM_SELECT_FIRST_COLLECTION = 'selectFirstCollection';
  public readonly QM_COLLECTION_PROMPT = 'promptQmCollection';
  public readonly CIVIL_JURISDICTION = 'CIVIL';

  public queryCreateContextEnum = QueryCreateContext;
  public eventCompletionParams: EventCompletionParams;

  constructor(
      private readonly route: ActivatedRoute,
      private readonly router: Router,
    private readonly sessionStorageService: SessionStorageService
  ) {}

  public ngOnChanges(changes: SimpleChanges): void {
    this.setCaseQueriesCollectionData();
    if (changes) {
      // console.log('QueryWriteRaiseQueryComponent initialized with eventData:', this.eventData);
      // this.generateCaseQueriesCollectionData();
      if (this.triggerSubmission) {
        this.queryDataCreated.emit(this.generateCaseQueriesCollectionData());
        this.generateCaseQueriesCollectionData();
      }
    }
  }

  onSubjectInput(): void {
    const control = this.formGroup.get('subject');
    const value = control?.value;
    if (value && value.length > 200) {
      control?.setValue(value.substring(0, 200));
    }
  }

  getSubjectErrorMessage(): string {
    const control = this.formGroup.get('subject');
    if (control.hasError('required')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT;
    }
    if (control.hasError('maxlength')) {
      return this.raiseQueryErrorMessage.QUERY_SUBJECT_MAX_LENGTH;
    }
    return '';
  }

  public setCaseQueriesCollectionData(): void {
    if (this.eventData?.case_fields?.length) {
      // Workaround for multiple qmCaseQueriesCollections that are not to be appearing in the eventData
      // Counts number qmCaseQueriesCollections
      const numberOfCaseQueriesCollections = this.eventData?.case_fields?.filter(
        (caseField) =>
          caseField.field_type.id === this.CASE_QUERIES_COLLECTION_ID &&
          caseField.field_type.type === this.FIELD_TYPE_COMPLEX && caseField.display_context !== this.DISPLAY_CONTEXT_READONLY
      )?.length || 0;

      this.caseQueriesCollections = this.eventData.case_fields.reduce((acc, caseField) => {
        // Extract the ID based on conditions, updating this.fieldId dynamically
        this.extractCaseQueryId(caseField, numberOfCaseQueriesCollections);

        const extractedCaseQueriesFromCaseField = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
        if (extractedCaseQueriesFromCaseField && typeof extractedCaseQueriesFromCaseField === 'object') {
          acc.push(extractedCaseQueriesFromCaseField);
        }

        // console.log(`Extracted Case Queries from Case Field: ${caseField.id}`, acc, this.caseQueriesCollections);
        return acc;
      }, []);
    }
  }

  private extractCaseQueryId(data: CaseField, count: number): void {
    const { id, value } = data;
    const messageId = this.route.snapshot.params.dataid;

    // Check if the field_type matches CaseQueriesCollection and type is Complex
    if (data.field_type.id === this.CASE_QUERIES_COLLECTION_ID && data.field_type.type === this.FIELD_TYPE_COMPLEX) {
      if (this.isNewQueryContext(data)) {
        // If there is more than one qmCaseQueriesCollection, pick the one with the lowest order
        if (count > 1) {
          if (!this.handleMultipleCollections()) {
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

  private generateCaseQueriesCollectionData(): QmCaseQueriesCollection {
    const currentUserDetails = JSON.parse(this.sessionStorageService.getItem(USER_DETAILS));

    const caseMessage = this.queryCreateContext === QueryCreateContext.NEW_QUERY
      ? QueryManagementUtils.getNewQueryData(this.formGroup, currentUserDetails)
      : QueryManagementUtils.getRespondOrFollowupQueryData(this.formGroup, this.queryItem, currentUserDetails);

    const messageId = this.route.snapshot.params.dataid; // Get the message ID from route params (if present)
    const isNewQuery = this.queryCreateContext === QueryCreateContext.NEW_QUERY; // Check if this is a new query

    // Check if the field ID has been set dynamically
    if (!this.fieldId) {
      console.error('Error: Field ID for CaseQueriesCollection not found. Cannot proceed with data generation.');
      this.router.navigate(['/', 'service-down']);
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
        const originalPartyName = this.caseQueriesCollections[0].partyName;

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

  private isNewQueryContext(data: CaseField): boolean {
    return this.queryCreateContext === QueryCreateContext.NEW_QUERY && data.display_context !== this.DISPLAY_CONTEXT_READONLY;
  }

  private handleMultipleCollections(): boolean {
    const jurisdictionId = this.caseDetails?.case_type?.jurisdiction?.id;

    if (!jurisdictionId) {
      console.error('Jurisdiction ID is missing.');
      return false;
    }

    if (this.getCollectionSelectionMethod(jurisdictionId) === this.QM_SELECT_FIRST_COLLECTION) {
      // Pick the collection with the lowest order
      this.fieldId = this.getCaseQueriesCollectionFieldOrderFromWizardPages()?.id;
    } else {
      // Display Error, for now, until EXUI-2644 is implemented
      console.error(`Error: Multiple CaseQueriesCollections are not supported yet for the ${jurisdictionId} jurisdiction`);
      return false;
    }

    return true;
  }

  private getCollectionSelectionMethod(jurisdiction: string): string {
    return jurisdiction.toUpperCase() === this.CIVIL_JURISDICTION ? this.QM_SELECT_FIRST_COLLECTION : this.QM_COLLECTION_PROMPT;
  }

  private getCaseQueriesCollectionFieldOrderFromWizardPages(): CaseField | undefined {
    const candidateFields = this.eventData?.case_fields?.filter(
      (field) =>
        field.field_type.id === this.CASE_QUERIES_COLLECTION_ID &&
        field.field_type.type === this.FIELD_TYPE_COMPLEX &&
        field.display_context !== this.DISPLAY_CONTEXT_READONLY
    );

    if (!candidateFields?.length) {
      return undefined;
    }

    const firstPageFields = this.eventData?.wizard_pages?.[0]?.wizard_page_fields;

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

  public submit(): void {
    this.generateCaseQueriesCollectionData();
  }
}
