import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { EventStartGuard } from './event-start.guard';

describe('EventStartGuard', () => {
    const router = jasmine.createSpyObj('router', ['navigate']);
    const service = jasmine.createSpyObj('service', ['anyTasksRequired']);
    const guard = new EventStartGuard(router, service);

    it('canActivate should return false', () => {
        const route = {} as ActivatedRouteSnapshot;
        route.params = {}
        route.params.cid = '1234567891234567';
        route.params.eid = 'start';
        service.anyTasksRequired.and.returnValue(of(false));
        const canActivate$ = guard.canActivate(route);
        canActivate$.subscribe(canActivate => {
            expect(router.navigate).not.toHaveBeenCalled();
            expect(canActivate).toBeTruthy();
            expect(router.navigate).not.toHaveBeenCalled();
        });
    });

    it('canActivate should return true', () => {
        const route = {} as ActivatedRouteSnapshot;
        route.params = {}
        route.params.cid = '1234567891234567';
        route.params.eid = 'start';
        service.anyTasksRequired.and.returnValue(of(true));

        const canActivate$ = guard.canActivate(route);
        canActivate$.subscribe(canActivate => {
            expect(router.navigate).toHaveBeenCalled();
            expect(canActivate).toBeFalsy();
            expect(router.navigate).toHaveBeenCalledWith(['/cases/case-details/1234567891234567/eventStart']);
        });
    });
});
