import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Caseworker } from '../../../../domain/work-allocation/case-worker.model';
import { Judicialworker } from '../../../../domain/work-allocation/judicial-worker.model';
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
    // Get the caseworker based on the assigned user id
    const caseworkers$: Observable<Caseworker[]> = this.caseworkerService.getCaseworkers([this.task.assignee]);
    this.caseworkerSubscription = caseworkers$.subscribe(caseworkers => {
      if (caseworkers && caseworkers[0].firstName && caseworkers[0].lastName) {
        this.assignedUserName = `${caseworkers[0].firstName} ${caseworkers[0].lastName}`;
      } else {
        // Get the judicial worker based on the assigned user id
        const judicialworkers$: Observable<Judicialworker[]> = this.judicialworkerService.getJudicialworkers([this.task.assignee]);
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
    if (this.caseworkerSubscription) {
      this.caseworkerSubscription.unsubscribe();
    }
    if (this.judicialworkerSubscription) {
      this.judicialworkerSubscription.unsubscribe();
    }
  }
}
