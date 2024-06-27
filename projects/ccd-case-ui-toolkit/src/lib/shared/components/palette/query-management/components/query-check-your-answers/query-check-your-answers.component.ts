import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import {
  CaseEventData,
  CaseEventTrigger,
  CaseView,
  CaseViewTrigger,
  TaskSearchParameter
} from '../../../../../../../lib/shared/domain';
import { SessionStorageService } from '../../../../../services';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, CasesService, WorkAllocationService } from '../../../../case-editor/services';
import { CaseQueriesCollection, QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagementUtils } from '../../utils/query-management.utils';
@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss']
})
export class QueryCheckYourAnswersComponent implements OnInit, OnDestroy {
  private readonly RAISE_A_QUERY_EVENT_TRIGGER_ID = 'queryManagementRaiseQuery';
  private readonly RESPOND_TO_QUERY_EVENT_TRIGGER_ID = 'queryManagementRespondQuery';

  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Output() public backClicked = new EventEmitter<boolean>();
  @Output() public querySubmitted = new EventEmitter<boolean>();

  private caseViewTrigger: CaseViewTrigger;
  private caseDetails: CaseView;
  private queryId: string;
  private getEventTrigger$: Observable<CaseEventTrigger>;
  private createEventSubscription: Subscription;
  private searchTasksSubsciption: Subscription;

  public queryCreateContextEnum = QueryCreateContext;
  public eventCompletionParams: EventCompletionParams;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly casesService: CasesService,
    private readonly caseNotifier: CaseNotifier,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService) {
  }

  public ngOnInit(): void {
    this.queryId = this.route.snapshot.params.qid;
    this.caseNotifier.caseView.pipe(take(1)).subscribe(caseDetails => {
      this.caseDetails = caseDetails;
      if (this.queryCreateContext === QueryCreateContext.RESPOND) {
        // Find raise a query event trigger from the list, will be used when submitting the query
        this.caseViewTrigger = this.caseDetails.triggers.find((trigger) => trigger.id = this.RAISE_A_QUERY_EVENT_TRIGGER_ID);
        // Initialise getEventTrigger observable, will be used when submitting the query
        this.getEventTrigger$ = this.casesService.getEventTrigger(undefined, this.RAISE_A_QUERY_EVENT_TRIGGER_ID, this.caseDetails.case_id);
      } else {
        // Raise a query and Follow-up query uses the same event trigger id
        // Find raise a query event trigger from the list, will be used when submitting the query
        this.caseViewTrigger = this.caseDetails.triggers.find((trigger) => trigger.id = this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID);
        // Initialise getEventTrigger observable, will be used when submitting the query
        this.getEventTrigger$ = this.casesService.getEventTrigger(undefined, this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID, this.caseDetails.case_id);
      }

      // To be set after integration
      this.eventId = 'respondToQuery';
    });
  }

  public ngOnDestroy(): void {
    this.createEventSubscription?.unsubscribe();
    this.searchTasksSubsciption?.unsubscribe();
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {
    // Generate case queries collection data for submission
    const data = this.generateCaseQueriesCollectionData();
    // Actual submission of query
    this.createEventSubscription = this.getEventTrigger$.pipe(
      switchMap((caseEventTrigger: CaseEventTrigger) => {
        // Setup CaseEventData
        const caseEventData: CaseEventData = {
          data,
          event: {
            id: this.caseViewTrigger.id,
            summary: '',
            description: this.caseViewTrigger.description
          },
          event_token: caseEventTrigger.event_token,
          ignore_warning: false
        };
        // Complete event
        return this.casesService.createEvent(this.caseDetails, caseEventData);
      })
    ).subscribe(
      // Successful response
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
    this.searchTasksSubsciption = this.workAllocationService.searchTasks(searchParameter)
      .subscribe((response: any) => {
        // Filter task by query id
        const filteredtask = response.tasks?.find((task) => {
          return Object.values(task.additional_properties).some((value) => {
            if (value === this.queryId) {
              return task;
            }
          });
        });
        // Trigger event completion
        this.eventCompletionParams = {
          caseId: this.caseDetails.case_id,
          eventId: this.RESPOND_TO_QUERY_EVENT_TRIGGER_ID,
          task: filteredtask
        };
      });
  }

  private generateCaseQueriesCollectionData(): CaseQueriesCollection {
    const currentUserDetails = JSON.parse(this.sessionStorageService.getItem('userDetails'));

    const caseMessage = this.queryCreateContext === QueryCreateContext.NEW_QUERY
      ? QueryManagementUtils.getNewQueryData(this.formGroup, currentUserDetails)
      : QueryManagementUtils.getRespondOrFollowupQueryData(this.formGroup, this.queryItem, currentUserDetails);

    return {
      partyName: '', // Not returned by CCD
      roleOnCase: '', // Not returned by CCD
      caseMessages: [
        {
          id: null,
          value: caseMessage
        }
      ]
    };
  }
}
