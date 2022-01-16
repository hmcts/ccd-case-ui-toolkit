import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { Task } from '../../../../../domain/work-allocation/Task';
import { AlertService, SessionStorageService } from '../../../../../services';
import { WorkAllocationService } from '../../../services';
import { CaseEventCompletionComponent, COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';

@Component({
  selector: 'app-case-event-completion-task-reassigned',
  templateUrl: './case-event-completion-task-reassigned.html'
})
export class CaseEventCompletionTaskReassignedComponent implements OnInit, OnDestroy {

  public caseId: string;
  public assignedUserId: string;
  public assignedUserName: string;
  public subscription: Subscription;

  constructor(@Inject(COMPONENT_PORTAL_INJECTION_TOKEN) private parentComponent: CaseEventCompletionComponent,
    private readonly route: ActivatedRoute,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly alertService: AlertService) {
    this.caseId = this.route.snapshot.params['cid'];
  }

  public ngOnInit(): void {
    const caseworkers: any = JSON.parse(this.sessionStorageService.getItem('caseworkers'));
    const caseworker = caseworkers.find(x => x.idamId === this.assignedUserId);
    this.assignedUserName = caseworker !== undefined ? `${caseworker.firstName} ${caseworker.lastName}` : 'another user';
    // TODO: If the task is not assigned to a caseworker, then
    // we have to perform an api call to check whether the task is assigned to judicial user
    // and display the judicial user name instead of 'another user'
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  public onContinue(): void {
    let userId: string;
    let taskId: string;

    // Get user details
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    if (userInfoStr) {
      const userInfo = JSON.parse(userInfoStr);
      userId = userInfo.id ? userInfo.id : userInfo.uid;
    }

    // Get task details
    const taskStr = this.sessionStorageService.getItem('taskToComplete');
    if (taskStr) {
      // Task is in session storage
      const task: Task = JSON.parse(taskStr);
      taskId = task.id;
    }

    // Assign and complete task
    this.subscription = this.workAllocationService.assignAndCompleteTask(taskId).subscribe(
      response => {
        // Emit event can be completed event
        this.parentComponent.eventCanBeCompleted.emit(true);
      },
      error => {
        // Emit event cannot be completed event
        this.parentComponent.eventCanBeCompleted.emit(false);
        this.alertService.error(error.message);
        return throwError(error);
      });
  }
}
