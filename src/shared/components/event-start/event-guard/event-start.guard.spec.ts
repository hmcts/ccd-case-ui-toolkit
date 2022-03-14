import { ActivatedRouteSnapshot } from '@angular/router';
import { EventStartGuard } from './event-start.guard';
import { of } from 'rxjs';
import { TaskPayload } from '../../../domain/work-allocation/TaskPayload';

import createSpyObj = jasmine.createSpyObj;
import { AbstractAppConfig } from '../../../../app.config';

describe('EventStartGuard', () => {
  const WORK_ALLOCATION_1_API_URL = 'workallocation';
  const WORK_ALLOCATION_2_API_URL = 'workallocation2';
  const tasks: any[] = [
    {
      assignee: null,
      assigneeName: null,
      id: '0d22d838-b25a-11eb-a18c-f2d58a9b7bc6',
      task_title: 'Some lovely task name',
      dueDate: '2021-05-20T16:00:00.000+0000',
      description: '[End the appeal](/cases/case-details/${[CASE_REFERENCE]}/trigger/endAppeal/endAppealendAppeal',
      location_name: 'Newcastle',
      location_id: '366796',
      case_id: '1620409659381330',
      case_category: 'asylum',
      case_name: 'Alan Jonson',
      permissions: [],
    }
  ];
  const route = {} as ActivatedRouteSnapshot;
  route.params = {}
  route.params.cid = '1620409659381330';
  route.params.eid = 'start';
  route.queryParams = {};
  const router = createSpyObj('router', ['navigate']);
  const service = createSpyObj('service', ['getTasksByCaseIdAndEventId']);
  const appConfig = createSpyObj<AbstractAppConfig>('appConfig', ['getWorkAllocationApiUrl']);
  const sessionStorageService = createSpyObj('sessionStorageService', ['getItem']);
  sessionStorageService.getItem.and.returnValue(JSON.stringify({cid: '1620409659381330', caseType: 'caseType', jurisdiction: 'IA'}));
  it('canActivate should return false', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_2_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const payload: TaskPayload = {
      task_required_for_event: true,
      tasks
    }
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(false);
    });
  });

  it('canActivate should return true', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_2_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const payload: TaskPayload = {
      task_required_for_event: false,
      tasks: []
    }
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(true);
    });
  });

  it('canActivate should return true for work allocation 1', () => {
    appConfig.getWorkAllocationApiUrl.and.returnValue(WORK_ALLOCATION_1_API_URL);
    const guard = new EventStartGuard(service, router, appConfig, sessionStorageService);
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(canActivate).toEqual(true);
    });
  });
});
