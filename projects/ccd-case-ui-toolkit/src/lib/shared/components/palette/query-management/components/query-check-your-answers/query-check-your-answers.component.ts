import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { TaskSearchParameter } from '../../../../../../shared/domain';
import { SessionStorageService } from '../../../../../../shared/services';
import { CaseNotifier } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagmentService } from '../../services/query-managment.service';

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
  private caseId: string;
  private queryId: string;
  public searchTasksSubsciption: Subscription;
  public completeTaskSubsciption: Subscription;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly caseNotifier: CaseNotifier,
    private readonly queryManagementService: QueryManagmentService,
    private readonly sessionStorageService: SessionStorageService
  ) { }

  public ngOnInit(): void {
    this.queryId = this.activatedRoute.snapshot.params.qid;
    this.caseNotifier.caseView.pipe(take(1)).subscribe(caseDetails => {
      this.caseId = caseDetails.case_id;
    });
  }

  public ngOnDestroy(): void {
    this.completeTaskSubsciption?.unsubscribe();
    this.searchTasksSubsciption?.unsubscribe();
 }

  public goBack(): void {
    this.backClicked.emit(true);
  }

  public submit(): void {
    this.searchAndCompleteTask();
  }

  public searchAndCompleteTask(): void {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const userInfo = JSON.parse(userInfoStr);
    // Search task
    const searchParameter = { ccdId: this.caseId } as TaskSearchParameter;
    this.searchTasksSubsciption = this.queryManagementService.searchTasks(searchParameter).subscribe(
      (response: any) => {
        // Filter task by queryId
        const filteredtask = response.tasks.find((task) => {
          return Object.values(task.additional_properties).some((value) => {
            if (value === this.queryId && task.assignee === userInfo.id) {
              return task;
            }
          })
        })
        if (filteredtask) {
          this.queryManagementService.completeTask(filteredtask.id).subscribe();
        }
      },
      error => {
        return throwError(error);
      });
  }
}
