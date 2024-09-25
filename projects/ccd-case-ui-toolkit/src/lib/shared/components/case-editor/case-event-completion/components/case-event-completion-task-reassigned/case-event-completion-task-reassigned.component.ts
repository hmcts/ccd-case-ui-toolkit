import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, throwError } from 'rxjs';
import { Task } from '../../../../../domain/work-allocation/Task';
import {
  AlertService,
  FieldsUtils,
  SessionStorageService
} from '../../../../../services';
import { CaseworkerService } from '../../../services/case-worker.service';
import { JudicialworkerService } from '../../../services/judicial-worker.service';
import { WorkAllocationService } from '../../../services/work-allocation.service';
import { COMPONENT_PORTAL_INJECTION_TOKEN, CaseEventCompletionComponent } from '../../case-event-completion.component';

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

  constructor(@Inject(COMPONENT_PORTAL_INJECTION_TOKEN) private readonly parentComponent: CaseEventCompletionComponent,
    private readonly route: ActivatedRoute,
    private readonly workAllocationService: WorkAllocationService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly judicialworkerService: JudicialworkerService,
    private readonly caseworkerService: CaseworkerService,
    private readonly alertService: AlertService) {
  }

  public ngOnInit(): void {
    // Get case id and task from the parent component
    this.caseId = this.parentComponent.context.caseId;
    const task = this.parentComponent.context.reassignedTask;

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
    const clientContextStr = this.sessionStorageService.getItem('clientContext');
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    const task = userTask ? userTask.task_data : null;
    // not complete_task not utilised here as related to event completion
    // service wanting task associated with event to not be completed not directly relevant
    if (task) {
      this.sessionStorageService.setItem('assignNeeded', 'true');
      // set event can be completed to true
      this.parentComponent.eventCanBeCompleted.emit(true);
    } else {
      // Emit event cannot be completed event
      this.parentComponent.eventCanBeCompleted.emit(false);
    }
  }
}
