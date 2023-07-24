import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError, map, take } from 'rxjs/operators';
import { TaskSearchParameter } from '../../../../../../shared/domain';
import { SessionStorageService } from '../../../../../../shared/services';
import { CaseNotifier, MULTIPLE_TASKS_FOUND } from '../../../../case-editor/services';
import { QueryCreateContext, QueryListItem } from '../../models';
import { QueryManagmentService } from '../../services/query-managment.service';

@Component({
  selector: 'ccd-query-check-your-answers',
  templateUrl: './query-check-your-answers.component.html',
  styleUrls: ['./query-check-your-answers.component.scss']
})
export class QueryCheckYourAnswersComponent implements OnInit{
  @Input() public formGroup: FormGroup;
  @Input() public queryItem: QueryListItem;
  @Input() public queryCreateContext: QueryCreateContext;
  @Output() public backClicked = new EventEmitter<boolean>();
  public queryCreateContextEnum = QueryCreateContext;
  private caseId: string;
  private queryId: string;

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
    this.queryManagementService.searchTasks(searchParameter)
      .pipe(
        map((response: any) => {
          const tasks: any[] = response.tasks;

          // Filter task by queryId
          const filteredtask = tasks.find((task) => task.additional_properties.some((property) => property === this.queryId) &&
            task.assignee === userInfo.uid)

          if (filteredtask && filteredtask.length > 0) {
            if (tasks.length === 1) {
              this.queryManagementService.completeTask(filteredtask[0].id).subscribe();
            } else {
              throw new Error(MULTIPLE_TASKS_FOUND);
            }
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
  }
}
