import { EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '../../..';
import { Task } from '../../../domain/work-allocation/Task';
import { SessionStorageService } from '../../../services/session/session-storage.service';
import { WorkAllocationService } from '../services/work-allocation.service';

export interface EventCompletionComponentEmitter {
  eventCanBeCompleted: EventEmitter<boolean>;
  showPortal(portalType: number);
}

export interface EventCompletionStateMachineContext {
  task: Task;
  caseId: string;
  eventId: string;
  reassignedTask: Task;
  router: Router;
  route: ActivatedRoute;
  sessionStorageService: SessionStorageService;
  workAllocationService: WorkAllocationService;
  alertService: AlertService,
  canBeCompleted: boolean;
  component: EventCompletionComponentEmitter;
}
