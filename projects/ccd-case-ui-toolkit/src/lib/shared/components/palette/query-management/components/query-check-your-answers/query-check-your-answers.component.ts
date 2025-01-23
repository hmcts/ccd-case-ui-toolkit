import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  CaseEventTrigger,
  CaseField,
  CaseView,
  CaseViewTrigger,
  ErrorMessage,
  TaskSearchParameter
} from '../../../../../../../lib/shared/domain';
import { SessionStorageService } from '../../../../../services';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
import { FormDocument } from '../../../../../../../lib/shared/domain/document';
import { QualifyingQuestionService } from '../../services/qualifying-question.service';
import { AccessControlList } from '../../../../../domain/definition/access-control-list.model';
@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss']
})
export class QueryCheckYourAnswersComponent implements OnInit, OnDestroy {
  private readonly RAISE_A_QUERY_EVENT_TRIGGER_ID = 'queryManagementRaiseQuery';
  private readonly RESPOND_TO_QUERY_EVENT_TRIGGER_ID = 'queryManagementRespondQuery';

  private readonly CASE_QUERIES_COLLECTION_ID = 'CaseQueriesCollection';
  public readonly FIELD_TYPE_COMPLEX = 'Complex';

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public eventData: CaseEventTrigger | null = null;
  @Input() public roleName: string;
  @Output() public backClicked = new EventEmitter<boolean>();
  @Output() public querySubmitted = new EventEmitter<boolean>();

  private caseViewTrigger: CaseViewTrigger;
  public caseDetails: CaseView;
  private queryId: string;
  private tid: string;
  private createEventSubscription: Subscription;
  private searchTasksSubscription: Subscription;

  public queryCreateContextEnum = QueryCreateContext;
  public eventCompletionParams: EventCompletionParams;
  public caseQueriesCollections: CaseQueriesCollection[];
  public fieldId: string;
  public attachments: FormDocument[];

  public errorMessages: ErrorMessage[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly qualifyingQuestionService: QualifyingQuestionService
  ) {}

  public ngOnInit(): void {
    this.queryId = this.route.snapshot.params.qid;
    this.tid = this.route.snapshot.queryParams?.tid;

    console.log('tid:', this.tid);
    this.caseNotifier.caseView.pipe(take(1)).subscribe((caseDetails) => {
      this.caseDetails = caseDetails;
      console.log('caseDetails:', this.caseDetails.case_id, this.caseDetails);

      // Find the appropriate event trigger based on the queryCreateContext
      this.caseViewTrigger = this.caseDetails.triggers.find((trigger) =>
        this.queryCreateContext !== QueryCreateContext.RESPOND
        // If the context is not 'RESPOND', find the trigger with the ID for raising a query
          ? trigger.id === this.RAISE_A_QUERY_EVENT_TRIGGER_ID
        // If the context is 'RESPOND', find the trigger with the ID for responding to a query
          : trigger.id === this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID
      );
    });

    // Get the document attachments
    this.getDocumentAttachments();

    this.setCaseQueriesCollectionData();

    this.workAllocationService.getTasksByCaseIdAndEventId(this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID, this.caseDetails.case_id, this.caseDetails.case_type.id, this.caseDetails.case_type.jurisdiction.id)
      .subscribe(
        (response: any) => {
          console.log('response:-queryManagementRespondToQ', response);
        }
      );

    if (this.tid) {
      this.workAllocationService.getTask(this.tid).subscribe(
        (response: any) => {
          console.log('response-tid------:', response);
        },
        (error) => {
          console.error('Error in getTask:', error);
          // Handle error appropriately
        }
      );
    }

    const searchParameter = { ccdId: this.caseDetails.case_id };
    this.workAllocationService.searchTasks(searchParameter)
      .subscribe(
        (response: any) => {
          console.log('response:searchTasks', response);
        },
      );
  }

  public ngOnDestroy(): void {
    this.createEventSubscription?.unsubscribe();
    this.searchTasksSubscription?.unsubscribe();
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {
    // Check if fieldId is null or undefined
    if (!this.fieldId) {
      console.error('Error: Field ID is missing. Cannot proceed with submission.');
      this.errorMessages = [
        {
          title: 'Error',
          description: 'This case is not configured for query management.',
          fieldId: 'field-id'
        }
      ];
      return;
    }

    const data = this.generateCaseQueriesCollectionData();
    this.createEventSubscription = this.casesService.createEvent(this.caseDetails, {
      data,
      event: {
        id: this.caseViewTrigger?.id,
        summary: '',
        description: this.caseViewTrigger?.description
      },
      event_token: this.eventData?.event_token,
      ignore_warning: false
    }).subscribe(
      () => {
        // Search and complete task
        this.searchAndCompleteTask();
        // Emit query submitted event
        this.querySubmitted.emit(true);
        this.qualifyingQuestionService.clearQualifyingQuestionSelection();
      },
      // Error
      () => this.router.navigate(['/', 'service-down'])
    );
  }

  public searchAndCompleteTask(): void {
    // Search Task
    this.searchTasksSubscription = this.workAllocationService.getTasksByCaseIdAndEventId(this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID, this.caseDetails.case_id, this.caseDetails.case_type.id, this.caseDetails.case_type.jurisdiction.id)
      .subscribe(
        (response: any) => {
          // Filter task by query id
          const filteredTask = response.tasks?.find((task) => task.case_id === this.queryId);
          // Trigger event completion
          this.eventCompletionParams = {
            caseId: this.caseDetails.case_id,
            eventId: this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID,
            task: filteredTask
          };
        },
        (error) => {
          console.error('Error in searchTasksSubscription:', error);
          // Handle error appropriately
        }
      );
  }

  private generateCaseQueriesCollectionData(): QmCaseQueriesCollection {
    const currentUserDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));

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
        // If no collection matches, or it's a new query
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

  public setCaseQueriesCollectionData(): void {
    if (this.eventData?.case_fields?.length) {
      // Workaround for multiple qmCaseQueriesCollections that are not to be appearing in the eventData
      // Counts number qmCaseQueriesCollections
      const numberOfCaseQueriesCollections = this.eventData?.case_fields?.filter(
        (caseField) =>
          caseField.field_type.id === this.CASE_QUERIES_COLLECTION_ID &&
          caseField.field_type.type === this.FIELD_TYPE_COMPLEX
      )?.length || 0;

      this.caseQueriesCollections = this.eventData.case_fields.reduce((acc, caseField) => {
        // Extract the ID based on conditions, updating this.fieldId dynamically
        this.extractCaseQueryId(caseField, numberOfCaseQueriesCollections);

        const extractedCaseQueriesFromCaseField = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
        if (extractedCaseQueriesFromCaseField && typeof extractedCaseQueriesFromCaseField === 'object') {
          acc.push(extractedCaseQueriesFromCaseField);
        }
        return acc;
      }, []);
    }
  }

  private extractCaseQueryId(data: CaseField, count: number): void {
    const { id, value, acls } = data;
    const messageId = this.route.snapshot.params.dataid;

    // Check if the field_type matches CaseQueriesCollection and type is Complex
    if (data.field_type.id === this.CASE_QUERIES_COLLECTION_ID && data.field_type.type === this.FIELD_TYPE_COMPLEX) {
      if (this.queryCreateContext === QueryCreateContext.NEW_QUERY) {
        //if number qmCaseQueriesCollection is more then filter out the right qmCaseQueriesCollection
        this.setFieldId(count, acls, id);
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

  private setFieldId(count: number, acls: AccessControlList[], id: string) {
    if (count > 1) {
      const matchingRole = acls?.find((acl) => acl.role === this.roleName);
      if (matchingRole) {
        this.fieldId = id;
      }
    } else {
      // Set the field ID dynamically based on the extracted data
      this.fieldId = id; // Store the ID for use in generating newQueryData
    }
  }

  private getDocumentAttachments(): void {
    const attachmentsValue = this.formGroup.get('attachments').value;
    if (attachmentsValue && attachmentsValue.length > 0) {
      const documents = attachmentsValue;
      this.attachments = documents.map(QueryManagementUtils.documentToCollectionFormDocument);
    }
  }
}

