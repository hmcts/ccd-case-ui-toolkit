import { WindowService } from './window.service';
import { fakeAsync, tick } from '@angular/core/testing';

describe('WindowService', () => {
  const windowService: WindowService = new WindowService();
  const userName = 'test user';

  it('should get from session storage', () => {
    spyOn(window.sessionStorage, 'getItem');
    windowService.getSessionStorage('organisationDetails');
    expect(window.sessionStorage.getItem).toHaveBeenCalled();
  });

  it('should set from session storage', () => {
    spyOn(window.sessionStorage, 'setItem');
    windowService.setSessionStorage('organisationDetails', userName);
    expect(window.sessionStorage.setItem).toHaveBeenCalled();
  });

  it('should open on new tab', () => {
    const openedWindow = { opener: 'unsafe-reference' } as unknown as Window;
    spyOn(window, 'open').and.returnValue(openedWindow);
    windowService.openOnNewTab('organisationDetails');
    expect(window.open).toHaveBeenCalledWith('organisationDetails', '_blank', 'noopener,noreferrer');
    expect(openedWindow.opener).toBeNull();
  });

  it('should stop handing off when the new tab acknowledges the message', fakeAsync(() => {
      const openedWindow = {
        closed: false,
        opener: window,
        postMessage: jasmine.createSpy('postMessage')
      } as unknown as Window;
      spyOn(window, 'open').and.returnValue(openedWindow);
      const addEventListenerSpy = spyOn(window, 'addEventListener').and.callThrough();

      windowService.openOnNewTabWithMessage('media-viewer', '{}', 'token');
      expect(openedWindow.postMessage).toHaveBeenCalledTimes(1);

      const acknowledgementListener = addEventListenerSpy.calls.mostRecent().args[1] as EventListener;
      acknowledgementListener({
        origin: window.location.origin,
        source: openedWindow,
        data: { type: 'MEDIA_VIEWER_HANDOFF_RECEIVED', token: 'token' }
      } as MessageEvent);
      tick(1000);

      expect(openedWindow.postMessage).toHaveBeenCalledTimes(1);
      expect(openedWindow.opener).toBeNull();
  }));

  xit('should open on confirm message', () => {
    windowService.confirm('organisationDetails');
    expect(windowService.confirm).toHaveBeenCalled();
  });

  it('should trigger alert', () => {
    spyOn(windowService, 'alert');
    windowService.alert('test');
    expect(windowService.alert).toHaveBeenCalled();
  });
});
