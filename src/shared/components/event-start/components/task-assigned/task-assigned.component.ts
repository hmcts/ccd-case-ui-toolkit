import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Task } from '../../../../domain/work-allocation/Task';
import { CaseworkerService, JudicialworkerService } from '../../../case-editor/services';

@Component({
  selector: 'app-task-assigned',
  templateUrl: './task-assigned.component.html'
})
export class TaskAssignedComponent implements OnInit, OnDestroy {

  public task: Task = null;
  public caseId: string;
  public assignedUserName: string;
  public caseworkerSubscription: Subscription;
  public judicialworkerSubscription: Subscription;

  constructor(private readonly route: ActivatedRoute,
    private readonly judicialworkerService: JudicialworkerService,
    private readonly caseworkerService: CaseworkerService) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.task = this.route.snapshot.queryParams as Task;
  }

  public ngOnInit(): void {
    // Current user is a caseworker?
    this.caseworkerSubscription = this.caseworkerService.getCaseworkers(this.task.jurisdiction).subscribe(result => {
      console.log('CASE WORKERS', result);
      if (result && result[0].service === this.task.jurisdiction && result[0].caseworkers) {
        const caseworker = result[0].caseworkers.find(x => x.idamId === this.task.assignee);
        if (caseworker) {
          this.assignedUserName = `${caseworker.firstName} ${caseworker.lastName}`;
        }
      }

      if (!this.assignedUserName) {
        // Current user is a judicial user?
        this.judicialworkerSubscription =
          this.judicialworkerService.getJudicialworkers([this.task.assignee], this.task.jurisdiction)
            .subscribe(judicialworkers => {
              console.log('JUDICIAL WORKERS', result);
              if (judicialworkers) {
                const judicialworker = judicialworkers.find(x => x.sidam_id === this.task.assignee);
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
    if (this.caseworkerSubscription) {
      this.caseworkerSubscription.unsubscribe();
    }
    if (this.judicialworkerSubscription) {
      this.judicialworkerSubscription.unsubscribe();
    }
  }
}
