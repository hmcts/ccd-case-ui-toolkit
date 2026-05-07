import { Router } from '@angular/router';
import { SessionStorageGuard } from './session-storage.guard';
import { SessionStorageService } from './session-storage.service';

describe('SessionStorageGuard', () => {
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
  });

  it('should allow activation when no userDetails are present', () => {
    sessionStorageService.getItem.and.returnValue(null);
    const guard = new SessionStorageGuard(sessionStorageService, router);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should allow activation when userDetails contains valid JSON', () => {
    sessionStorageService.getItem.and.returnValue('{"id":"123"}');
    const guard = new SessionStorageGuard(sessionStorageService, router);

    expect(guard.canActivate()).toBe(true);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should log via injected logger and navigate to custom route on invalid JSON', () => {
    const logger = jasmine.createSpy('logger');
    sessionStorageService.getItem.and.returnValue('{bad-json');
    const guard = new SessionStorageGuard(sessionStorageService, router, '/custom-session-error', logger);

    expect(guard.canActivate()).toBe(false);
    expect(logger).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/custom-session-error']);
  });

  it('should log to console and navigate to default route on invalid JSON without logger', () => {
    spyOn(console, 'error');
    sessionStorageService.getItem.and.returnValue('{bad-json');
    const guard = new SessionStorageGuard(sessionStorageService, router);

    expect(guard.canActivate()).toBe(false);
    expect(console.error).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/session-error']);
  });
});
