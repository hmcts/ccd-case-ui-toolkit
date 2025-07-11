import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import {
  CaseEventTrigger,
  CaseField,
  CaseView,
  CaseViewTrigger,
  ErrorMessage
} from '../../../../../../../lib/shared/domain';
import { ErrorNotifierService, SessionStorageService } from '../../../../../services';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
import { FormDocument } from '../../../../../../../lib/shared/domain/document';
import { QualifyingQuestionService } from '../../services/qualifying-question.service';
import { Task } from '../../../../../domain/work-allocation/Task';
import { USER_DETAILS } from '../../../../../utils';

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
  public readonly DISPLAY_CONTEXT_READONLY = 'READONLY';
  public readonly QM_SELECT_FIRST_COLLECTION = 'selectFirstCollection';
  public readonly QM_COLLECTION_PROMPT = 'promptQmCollection';
  public readonly CIVIL_JURISDICTION = 'CIVIL';

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public eventData: CaseEventTrigger | null = null;
  @Output() public backClicked = new EventEmitter<boolean>();
  @Output() public querySubmitted = new EventEmitter<boolean>();
  @Output() public callbackConfirmationMessage = new EventEmitter<{ [key: string]: string }>();

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
  public filteredTasks: Task[] = [];
  public readyToSubmit: boolean;
  public isSubmitting: boolean = false;

  public callbackErrorsSubject: Subject<any> = new Subject();
  public error: any;

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

    this.caseNotifier.caseView.pipe(take(1)).subscribe((caseDetails) => {
      this.caseDetails = caseDetails;

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

    if (this.queryCreateContext === QueryCreateContext.RESPOND) {
      this.searchTasksSubscription = this.workAllocationService.getTasksByCaseIdAndEventId(this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID,
        this.caseDetails.case_id, this.caseDetails.case_type.id, this.caseDetails.case_type.jurisdiction.id)
        .subscribe({
          next: (response: any) => {
          // Filter task by query id
            if (this.tid) {
              if (response.tasks?.length > 1) {
                this.filteredTasks = response.tasks?.filter((task: Task) => task.id === this.tid);
              } else {
                this.filteredTasks = response.tasks;
              }
              this.readyToSubmit = true;
            }
          },
          error: (error) => {
            console.error('Error in searchTasksSubscription:', error);
            this.readyToSubmit = false;
          }
        });
    } else {
      this.readyToSubmit = true;
    }
  }

  public ngOnDestroy(): void {
    this.createEventSubscription?.unsubscribe();
    this.searchTasksSubscription?.unsubscribe();
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {

    if (this.isSubmitting) {
      return
    }

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
      window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
      return;
    }

    const data = this.generateCaseQueriesCollectionData();
    const createEvent$ = this.createEvent(data);

    this.isSubmitting = true;

    if (this.queryCreateContext === QueryCreateContext.RESPOND) {
      if (this.filteredTasks?.length > 0) {
        this.createEventSubscription = createEvent$.pipe(
          switchMap((createEventResponse) => {
            const confirmationBody = createEventResponse?.after_submit_callback_response?.confirmation_body;
            const confirmationHeader = createEventResponse?.after_submit_callback_response?.confirmation_header;
            this.callbackConfirmationMessage.emit({ body: confirmationBody, header: confirmationHeader });

            return this.workAllocationService.completeTask(
              this.filteredTasks[0].id,
              this.caseViewTrigger.name
            );
          })
        ).subscribe({
          next: () => this.finaliseSubmission(),
          error: (error) => this.handleError(error)
        });
      } else {
        console.error('Error: No task to complete was found');
        this.errorMessages = [
          {
            title: 'Error',
            description: 'No task to complete was found',
            fieldId: 'field-id'
          }
        ];
        this.isSubmitting = false;
        window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
        return;
      }
    } else {
      this.createEventSubscription = createEvent$.subscribe({
        next: (callbackResponse) => {
          this.finaliseSubmission();
          const confirmationBody = callbackResponse?.after_submit_callback_response?.confirmation_body;
          const confirmationHeader = callbackResponse?.after_submit_callback_response?.confirmation_header;
          this.callbackConfirmationMessage.emit({ body: confirmationBody, header: confirmationHeader });
        },
        error: (error) => this.handleError(error)
      });
    }
  }

  private createEvent(data: any): Observable<any> {
    return this.casesService.createEvent(this.caseDetails, {
      data,
      event: {
        id: this.caseViewTrigger?.id,
        summary: '',
        description: this.caseViewTrigger?.description
      },
      event_token: this.eventData?.event_token,
      ignore_warning: false
    });
  }

  private finaliseSubmission(): void {
    this.querySubmitted.emit(true);
    this.qualifyingQuestionService.clearQualifyingQuestionSelection();
    this.isSubmitting = false;
  }

  private handleError(error: any): void {
    console.error('Error in API calls:', error);
    this.isSubmitting = false;

    if (this.isServiceErrorFound(error)){
      this.error = null;
      this.callbackErrorsSubject.next(error);
    } else {
       if (error && error.status !== 401 && error.status !== 403) {
        this.error = error;
       } else {
        this.router.navigate(['/', 'service-down']);
       }
    }
    window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
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

  private getCollectionSelectionMethod(jurisdiction: string): string {
    return jurisdiction.toUpperCase() === this.CIVIL_JURISDICTION ? this.QM_SELECT_FIRST_COLLECTION : this.QM_COLLECTION_PROMPT;
  }

  private getDocumentAttachments(): void {
    const attachmentsValue = this.formGroup.get('attachments').value;
    if (attachmentsValue && attachmentsValue.length > 0) {
      const documents = attachmentsValue;
      this.attachments = documents.map(QueryManagementUtils.documentToCollectionFormDocument);
    }
  }

  public isServiceErrorFound(error: any): boolean {
    return !!(error?.callbackErrors?.length);
  }
}

