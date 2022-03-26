import { Router } from "@angular/router";
import { TaskPayload } from "../../domain/work-allocation/TaskPayload";
import { SessionStorageService } from "../../services";

export function checkTaskInEventNotRequired(payload: TaskPayload, caseId: string, eventId: string, sessionStorageService: SessionStorageService, router: Router): boolean {
  const taskNumber = payload.tasks.length;
  if (taskNumber === 0) {
    // if there are no tasks just carry on
    return true;
  }
  // Get number of tasks assigned to user
  const userInfoStr = this.sessionStorageService.getItem('userDetails');
  const userInfo = JSON.parse(userInfoStr);
  const tasksAssignedToUser = payload.tasks.filter(x =>
    x.task_state !== 'unassigned' && x.assignee === userInfo.id || x.assignee === userInfo.uid
  );
  if (tasksAssignedToUser.length === 0) {
    // if no tasks assigned to user carry on
    return true;
  } else if (tasksAssignedToUser.length > 1) {
    // if more than one task assigned to the user then give multiple tasks error
    router.navigate([`/cases/case-details/${caseId}/multiple-tasks-exist`]);
    return false;
  } else {
    // if one task assigned to user, allow user to complete event
    sessionStorageService.setItem('taskToComplete', JSON.stringify(tasksAssignedToUser[0]));
    router.navigate([`/cases/case-details/${caseId}/trigger/${eventId}`]);
    return true;
  }
}
