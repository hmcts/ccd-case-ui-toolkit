import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  CaseEventTrigger,
  CaseView,
  CaseViewTrigger,
  ErrorMessage,
  HttpError
} from '../../../../../../../lib/shared/domain';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { CaseQueriesCollection, QmCaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
import { FormDocument } from '../../../../../../../lib/shared/domain/document';
import { QualifyingQuestionService } from '../../services/qualifying-question.service';
import { Task } from '../../../../../domain/work-allocation/Task';
import { QueryManagementService } from '../../services/query-management.service';
import {
  AlertService,
  ErrorNotifierService
} from '../../../../../services';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss'],
  standalone: false
})
export class QueryCheckYourAnswersComponent implements OnInit, OnDestroy {
  private readonly RAISE_A_QUERY_EVENT_TRIGGER_ID = 'queryManagementRaiseQuery';
  private readonly RESPOND_TO_QUERY_EVENT_TRIGGER_ID = 'queryManagementRespondQuery';
  private readonly CASE_QUERIES_COLLECTION_ID = 'CaseQueriesCollection';

  public static readonly TRIGGER_TEXT_CONTINUE = 'Ignore Warning and Continue';
  public static readonly TRIGGER_TEXT_START = 'Continue';

  public readonly FIELD_TYPE_COMPLEX = 'Complex';
  public readonly DISPLAY_CONTEXT_READONLY = 'READONLY';
  public readonly QM_SELECT_FIRST_COLLECTION = 'selectFirstCollection';
  public readonly QM_COLLECTION_PROMPT = 'promptQmCollection';
  public readonly CIVIL_JURISDICTION = 'CIVIL';

  public triggerTextStart = QueryCheckYourAnswersComponent.TRIGGER_TEXT_START;
  public triggerTextIgnoreWarnings = QueryCheckYourAnswersComponent.TRIGGER_TEXT_CONTINUE;

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Input() public eventData: CaseEventTrigger | null = null;
  @Input() public multipleFollowUpFeature: boolean;
  @Input() public qmCaseQueriesCollectionData: QmCaseQueriesCollection;
  @Output() public backClicked = new EventEmitter<boolean>();
  @Output() public querySubmitted = new EventEmitter<boolean>();
  @Output() public callbackConfirmationMessage = new EventEmitter<{ [key: string]: string }>();
  @Output() public createEventResponse = new EventEmitter<any>();

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
  public messageId: string;
  public callbackErrorsSubject: Subject<any> = new Subject();

  public error: any;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly workAllocationService: WorkAllocationService,
    private readonly qualifyingQuestionService: QualifyingQuestionService,
    private queryManagementService: QueryManagementService,
    private readonly errorNotifierService: ErrorNotifierService,
    private readonly alertService: AlertService,
  ) {}

  public ngOnInit(): void {
    this.queryId = this.route.snapshot.params.qid;
    this.tid = this.route.snapshot.queryParams?.tid;
    this.messageId= this.route.snapshot.params.dataid;

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
          error: (error: HttpError) => {
            this.readyToSubmit = false;
            if (error.status !== 401 && error.status !== 403) {
              this.errorNotifierService.announceError(error);
              this.alertService.error({ phrase: error.message });
              console.error('Error occurred while fetching event data:', error);
              this.callbackErrorsSubject.next(error);
            } else {
              this.errorMessages = [
                {
                  title: 'Error',
                  description: 'Something unexpected happened. Please try again later.',
                  fieldId: 'field-id'
                }
              ];
            }

            window.scrollTo({ left: 0, top: 0, behavior: 'smooth' });
          }
        });
    } else {
      this.readyToSubmit = true;
    }
  }

  public ngOnDestroy(): void {
    this.createEventSubscription?.unsubscribe();
    this.searchTasksSubscription?.unsubscribe();
    this.callbackErrorsSubject?.unsubscribe();
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {
    if (this.isSubmitting) {
      return;
    }

    const data = this.qmCaseQueriesCollectionData;
    const createEvent$ = this.createEvent(data);

    // Make sure qmCaseQueriesCollectionData is present and non-empty
    const keys = data && typeof data === 'object' ? Object.keys(data) : [];
    const fieldId = keys.length ? keys[0] : undefined;

    this.isSubmitting = true;

    if (this.queryCreateContext === QueryCreateContext.RESPOND) {
      if (this.filteredTasks?.length > 0) {
        this.createEventSubscription = createEvent$.pipe(
          switchMap((createEventResponse) => {
            const confirmationBody = createEventResponse?.after_submit_callback_response?.confirmation_body;
            const confirmationHeader = createEventResponse?.after_submit_callback_response?.confirmation_header;
            this.callbackConfirmationMessage.emit({ body: confirmationBody, header: confirmationHeader });

            // Emit the extracted collection value (or null if not found)
            this.createEventResponse.emit(fieldId ? createEventResponse?.data?.[fieldId] ?? null : null);

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
          this.createEventResponse.emit(fieldId ? callbackResponse?.data?.[fieldId] ?? null : null);
          console.log('Query submitted successfully.', callbackResponse);
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

  public setCaseQueriesCollectionData(): void {
    if (!this.eventData) {
      console.warn('Event data not available; skipping collection setup.');
    }

    this.queryManagementService.setCaseQueriesCollectionData(
      this.eventData,
      this.queryCreateContext,
      this.caseDetails,
      this.messageId
    );
  }
}
