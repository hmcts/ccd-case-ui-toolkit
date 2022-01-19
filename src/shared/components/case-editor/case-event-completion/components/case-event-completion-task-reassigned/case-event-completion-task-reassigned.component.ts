import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, Observable, Subscription, throwError } from 'rxjs';
import { Caseworker } from '../../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../../domain/work-allocation/judicial-worker.model';
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
    // Get the assigned user id from the parent component
    this.assignedUserId = this.parentComponent.context.task.assignee;

    // Get the caseworker based on the assigned user id
    const caseworkers$: Observable<Caseworker[]> = this.caseworkerService.getCaseworkers([this.assignedUserId]);
    this.caseworkerSubscription = caseworkers$.subscribe(caseworkers => {
      if (caseworkers && caseworkers[0] && caseworkers[0].firstName && caseworkers[0].lastName) {
        this.assignedUserName = `${caseworkers[0].firstName} ${caseworkers[0].lastName}`;
      } else {
        // Get the judicial worker based on the assigned user id
        const judicialworkers$: Observable<Judicialworker[]> = this.judicialworkerService.getJudicialworkers([this.assignedUserId]);
        this.judicialworkerSubscription = judicialworkers$.subscribe(judicialworkers => {
          if (judicialworkers && judicialworkers[0].firstName && judicialworkers[0].lastName) {
            this.assignedUserName = `${judicialworkers[0].firstName} ${judicialworkers[0].lastName}`;
          } else {
            // As a fail safe display assigned user name as 'another user'
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
