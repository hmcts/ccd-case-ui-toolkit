import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { Task } from '../../../../../domain/work-allocation/Task';
import { AlertService, SessionStorageService } from '../../../../../services';
import { JudicialworkerService, WorkAllocationService } from '../../../services';
import { CaseworkerService } from '../../../services/case-worker.service';
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
  public caseworkerSubscription: Subscription;
  public judicialworkerSubscription: Subscription;

  constructor(@Inject(COMPONENT_PORTAL_INJECTION_TOKEN) private parentComponent: CaseEventCompletionComponent,
    private readonly route: ActivatedRoute,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly judicialworkerService: JudicialworkerService,
    private readonly caseworkerService: CaseworkerService,
    private readonly alertService: AlertService) {
  }

  public ngOnInit(): void {
    // Get case id and task from the parent component
    const { caseId, reassignedTask } = this.parentComponent.context;
    this.caseId = caseId;
    const task = reassignedTask;

    // Current user is a caseworker?
    this.caseworkerSubscription = this.caseworkerService.getCaseworkers(task.jurisdiction).subscribe(result => {
      if (result && result[0].service === task.jurisdiction && result[0].caseworkers) {
        const caseworker = result[0].caseworkers.find(x => x.idamId === task.assignee);
        if (caseworker) {
          this.assignedUserName = `${caseworker.firstName} ${caseworker.lastName}`;
        }
      }

      if (!this.assignedUserName) {
        // Current user is a judicial user?
        this.judicialworkerSubscription = this.judicialworkerService.getJudicialworkers([task.assignee], task.jurisdiction)
        .subscribe(judicialworkers => {
          if (judicialworkers) {
            const judicialworker = judicialworkers.find(x => x.sidam_id === task.assignee);
            if (judicialworker) {
              this.assignedUserName = judicialworker.full_name;
            }
          }

          if (!this.assignedUserName) {
            this.assignedUserName = 'another user';
          }
        });
      }
    });
  }

  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.caseworkerSubscription) {
      this.caseworkerSubscription.unsubscribe();
    }
    if (this.judicialworkerSubscription) {
      this.judicialworkerSubscription.unsubscribe();
    }
  }

  public onContinue(): void {
    // Get task details
    const taskStr = this.sessionStorageService.getItem('taskToComplete');
    if (taskStr) {
      // Task is in session storage
      const task: Task = JSON.parse(taskStr);

      // Assign and complete task
      this.subscription = this.workAllocationService.assignAndCompleteTask(task.id).subscribe(
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
    } else {
      // Emit event cannot be completed event
      this.parentComponent.eventCanBeCompleted.emit(false);
    }
  }
}
