import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FieldsUtils,
  SessionStorageService
} from '../../../../../services';
import { EventCompletionStateMachineContext } from '../../../domain';
import { CaseworkerService } from '../../../services/case-worker.service';
import { JudicialworkerService } from '../../../services/judicial-worker.service';
import { CaseEditComponent } from '../../../case-edit';

@Component({
  selector: 'app-case-event-completion-task-reassigned',
  templateUrl: './case-event-completion-task-reassigned.html',
  standalone: false
})
export class CaseEventCompletionTaskReassignedComponent implements OnInit, OnDestroy {
  @Input()
  context: EventCompletionStateMachineContext;
  @Output()
  public notifyEventCompletionReassigned: EventEmitter<boolean> = new EventEmitter<boolean>();

  public caseId: string;
  public assignedUserId: string;
  public assignedUserName: string;
  public subscription: Subscription;
  public caseworkerSubscription: Subscription;
  public judicialworkerSubscription: Subscription;
  public jurisdiction: string;
  public caseType: string;

  constructor(private readonly sessionStorageService: SessionStorageService,
    private readonly judicialworkerService: JudicialworkerService,
    private readonly caseworkerService: CaseworkerService) {
  }

  public ngOnInit(): void {
    // Get case id and task from the parent component
    this.caseId = this.context.caseId;
    const task = this.context.reassignedTask;
    this.jurisdiction = task.jurisdiction;
    this.caseType = task.case_type_id;

    // Current user is a caseworker?
    this.caseworkerSubscription = this.caseworkerService.getUserByIdamId(task.assignee).subscribe(caseworker => {
      if (caseworker) {
        this.assignedUserName = `${caseworker.firstName} ${caseworker.lastName}`;
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
    const clientContextStr = this.sessionStorageService.getItem(CaseEditComponent.CLIENT_CONTEXT);
    const userTask = FieldsUtils.getUserTaskFromClientContext(clientContextStr);
    const task = userTask ? userTask.task_data : null;
    // not complete_task not utilised here as related to event completion
    // service wanting task associated with event to not be completed not directly relevant
    if (task) {
      // Set session to override reassignment settings so code flow does not return to this component
      this.sessionStorageService.setItem('assignNeeded', 'true - override')
      this.notifyEventCompletionReassigned.emit(true);
    } else {
      // Emit event cannot be completed event
      this.notifyEventCompletionReassigned.emit(false);
    }
  }
}
