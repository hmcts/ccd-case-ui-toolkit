import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import {
  CaseEventTrigger,
  CaseView,
  CaseViewTrigger,
  ErrorMessage,
  TaskSearchParameter
} from '../../../../../../../lib/shared/domain';
import { SessionStorageService } from '../../../../../services';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, EventTriggerService, WorkAllocationService } from '../../../../case-editor/services';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
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
  @Output() public backClicked = new EventEmitter<boolean>();
  @Output() public querySubmitted = new EventEmitter<boolean>();

  private caseViewTrigger: CaseViewTrigger;
  private caseDetails: CaseView;
  private queryId: string;
  private createEventSubscription: Subscription;
  private searchTasksSubscription: Subscription;

  public queryCreateContextEnum = QueryCreateContext;
  public eventCompletionParams: EventCompletionParams;
  public caseQueriesCollections: CaseQueriesCollection[];
  public fieldId: string;

  public errorMessages: ErrorMessage[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly eventTriggerService: EventTriggerService
  ) {}

  public ngOnInit(): void {
    this.queryId = this.route.snapshot.params.qid;
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

    this.setCaseQueriesCollectionData();
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
          description: 'Something unexpected happened. please try again later.',
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
      },
      // Error
      () => this.router.navigate(['/', 'service-down'])
    );
  }

  public searchAndCompleteTask(): void {
    // Search Task
    const searchParameter = { ccdId: this.caseDetails.case_id } as TaskSearchParameter;
    this.searchTasksSubscription = this.workAllocationService.searchTasks(searchParameter)
      .subscribe(
        (response: any) => {
          // Filter task by query id
          const filteredTask = response.tasks?.find((task) =>
            Object.values(task.additional_properties).some((value) => value === this.queryId)
          );
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

    // Check if the field ID has been set dynamically
    if (!this.fieldId) {
      console.error('Error: Field ID for CaseQueriesCollection not found. Cannot proceed with data generation.');
      this.router.navigate(['/', 'service-down']);
    }

    // Base data structure for the query with dynamic property name
    const newQueryData: QmCaseQueriesCollection = {
      [this.fieldId]: {
        partyName: '', // Not returned by CCD
        roleOnCase: '', // Not returned by CCD
        caseMessages: [
          {
            id: null,
            value: caseMessage
          }
        ]
      }
    };

    // If caseQueriesCollections is not empty, append its data
    if (this.caseQueriesCollections?.length) {
      newQueryData[this.fieldId].caseMessages.push(
        ...this.caseQueriesCollections.flatMap((collection) => collection.caseMessages)
      );
    }
    return newQueryData;
  }

  public setCaseQueriesCollectionData(): void {
    if (this.eventData?.case_fields?.length) {
      this.caseQueriesCollections = this.eventData.case_fields.reduce((acc, caseField) => {
        // Extract the ID based on conditions, updating this.fieldId dynamically

        this.extractCaseQueryId(caseField);
        const extractedCaseQueriesFromCaseField = QueryManagementUtils.extractCaseQueriesFromCaseField(caseField);
        if (extractedCaseQueriesFromCaseField && typeof extractedCaseQueriesFromCaseField === 'object') {
          acc.push(extractedCaseQueriesFromCaseField);
        }
        return acc;
      }, []);
    }
  }

  private extractCaseQueryId(data): void {
    // Check if field_type.id is 'CaseQueriesCollection' and field_type.type is 'Complex'
    if (
      data.field_type.id === this.CASE_QUERIES_COLLECTION_ID &&
      data.field_type.type === this.FIELD_TYPE_COMPLEX
    ) {
      // Set the field ID dynamically based on the extracted data
      this.fieldId = data.id; // Store the ID for use in generating newQueryData
    }
  }
}

