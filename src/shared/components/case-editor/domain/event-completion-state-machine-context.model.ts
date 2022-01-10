import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { WorkAllocationService } from '../services/work-allocation.service';

export interface EventCompletionComponentEmitter {
  eventCanBeCompleted: EventEmitter<boolean>;
}

export interface EventCompletionStateMachineContext {
  task: Task;
  caseId: string;
  eventId: string;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  workAllocationService: WorkAllocationService;
  canBeCompleted: boolean;
  component: EventCompletionComponentEmitter;
}
