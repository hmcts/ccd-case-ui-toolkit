import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { TaskSearchParameter } from '../../../../../../../lib/shared/domain';
import { EventCompletionParams } from '../../../../case-editor/domain/event-completion-params.model';
import { CaseNotifier, WorkAllocationService } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss']
})
export class QueryCheckYourAnswersComponent implements OnInit, OnDestroy {
  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Output() public backClicked = new EventEmitter<boolean>();
  public queryCreateContextEnum = QueryCreateContext;

  public eventCompletionParams: EventCompletionParams;
  private caseId: string;
  private eventId: string;
  private queryId: string;
  private searchTasksSubsciption: Subscription;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly workAllocationService: WorkAllocationService,
    private readonly caseNotifier: CaseNotifier) { }

  public ngOnInit(): void {
    this.queryId = this.route.snapshot.params.qid;
    this.caseNotifier.caseView.pipe(take(1)).subscribe(caseDetails => {
      this.caseId = caseDetails.case_id;
      // To be set after integration
      this.eventId = 'respondToQuery';
    });
  }

  public ngOnDestroy(): void {
    this.searchTasksSubsciption?.unsubscribe();
  }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {
    // Search Task
    const searchParameter = { ccdId: this.caseId } as TaskSearchParameter;
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
          caseId: this.caseId,
          eventId: this.eventId,
          task: filteredtask
        };
      });
  }
}
