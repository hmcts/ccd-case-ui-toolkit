import { ActivatedRouteSnapshot } from '@angular/router';
import { EventStartGuard } from './event-start.guard';
import { of } from 'rxjs';
import { TaskPayload } from '../../domain/work-allocation/TaskPayload';

describe('EventStartGuard', () => {
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
  const router = jasmine.createSpyObj('router', ['navigate']);
  const service = jasmine.createSpyObj('service', ['getTasksByCaseIdAndEventId']);
  const guard = new EventStartGuard(router, service);

  it('canActivate should return true', () => {
    const route = {} as ActivatedRouteSnapshot;
    route.params = {}
    route.params.cid = '1620409659381330';
    route.params.eid = 'start';
    route.queryParams = {};
    const payload: TaskPayload = {
      tasks,
      task_required_for_event: true,
    }
    service.getTasksByCaseIdAndEventId.and.returnValue(of(payload));
    const canActivate$ = guard.canActivate(route);
    canActivate$.subscribe(canActivate => {
      expect(router.navigate).toHaveBeenCalled();
      expect(canActivate).toBeTruthy();
    });
  });
});
