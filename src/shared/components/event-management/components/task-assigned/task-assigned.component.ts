import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Task } from '../../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../../services';

@Component({
  selector: 'app-task-assigned',
  templateUrl: './task-assigned.component.html'
})
export class TaskAssignedComponent implements OnInit {

  public task: Task = null;
  public caseId: string;
  public assignedUserName: string;

  constructor(private readonly route: ActivatedRoute,
    private readonly sessionStorageService: SessionStorageService) {
    this.caseId = this.route.snapshot.data.case.case_id;
    this.task = this.route.snapshot.queryParams as Task;
  }

  public ngOnInit(): void {
    const caseworkers: any = JSON.parse(this.sessionStorageService.getItem('caseworkers'));
    const caseworker = caseworkers.find(x => x.idamId === this.task.assignee);
    this.assignedUserName = caseworker !== undefined ? `${caseworker.firstName} ${caseworker.lastName}` : 'another user';
    // TODO: If the task is not assigned to a caseworker, then
    // we have to perform an api call to check whether the task is assigned to judicial user
    // and display the judicial user name instead of 'another user'
  }
}
