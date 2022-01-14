import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { Task } from '../../../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../../../services';
import { WorkAllocationService } from '../../../services';
import { CaseEventCompletionComponent, COMPONENT_PORTAL_INJECTION_TOKEN } from '../../case-event-completion.component';

@Component({
  selector: 'app-case-event-completion-task-reassigned',
  templateUrl: './case-event-completion-task-reassigned.html'
})
export class CaseEventCompletionTaskReassignedComponent implements OnInit {

  public caseId: string;
  public assignedUserId: string;
  public assignedUserName: string;

  constructor(@Inject(COMPONENT_PORTAL_INJECTION_TOKEN) private parentComponent: CaseEventCompletionComponent,
    private readonly route: ActivatedRoute,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService) {
      debugger;
    this.caseId = this.route.snapshot.params['cid'];
    const eventId = this.route.snapshot.params['eid'];
  }

  public ngOnInit(): void {
    const caseworkers: any = JSON.parse(this.sessionStorageService.getItem('caseworkers'));
    const caseworker = caseworkers.find(x => x.idamId === this.assignedUserId);
    this.assignedUserName = caseworker !== undefined ? `${caseworker.firstName} ${caseworker.lastName}` : 'another user';
    // TODO: If the task is not assigned to a caseworker, then
    // we have to perform an api call to check whether the task is assigned to judicial user
    // and display the judicial user name instead of 'another user'
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

    if (userId && taskId) {
      // Reassign task to current user
      const reassignTaskObservable$ = this.workAllocationService.assignTask(taskId, userId);
      // Complete task
      const completeTaskObservable$ = this.workAllocationService.completeTask(taskId);

      debugger;

      combineLatest([reassignTaskObservable$, completeTaskObservable$]).toPromise()
        .then(() => {
          debugger;
          console.log('UPDATED');
          // Emit event can be completed event
          this.parentComponent.eventCanBeCompleted.emit(true);
        })
        .catch(error => {
          debugger;
          console.log('ERROR', error);
          // Emit event cannot be completed event
          this.parentComponent.eventCanBeCompleted.emit(false);
        });
    }
  }
}
