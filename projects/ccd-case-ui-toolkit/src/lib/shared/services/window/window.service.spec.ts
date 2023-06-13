import { WindowService } from './window.service';

describe('WindowService', () => {
  const windowService: WindowService = new WindowService();
  const userName = 'test user';
  const organisationDetails = 'test organisation';

  it('should remove from local storage', () => {
    windowService.setLocalStorage('user', userName);
    expect(windowService.getLocalStorage('user')).toBe(userName);
    expect(windowService.removeLocalStorage('user')).toBeUndefined();
    expect(windowService.getLocalStorage('user')).toBeNull();
  });

  it('should clear from local storage', () => {
    windowService.setLocalStorage('user', userName);
    expect(windowService.getLocalStorage('user')).toBe(userName);
    expect(windowService.clearLocalStorage()).toBeUndefined();
    expect(windowService.getLocalStorage('user')).toBeNull();
  });

  it('should be able to set null value in local storage', () => {
    windowService.setLocalStorage('user', null);
    expect(windowService.getLocalStorage('user')).toBe('null');
    expect(windowService.removeLocalStorage('user')).toBeUndefined();
  });

  it('should be set empty value in local storage', () => {
    windowService.setLocalStorage('user', '');
    expect(windowService.getLocalStorage('user')).toBe('');
    expect(windowService.removeLocalStorage('user')).toBeUndefined();
  });

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
    spyOn(window, 'open');
    windowService.openOnNewTab('organisationDetails');
    expect(window.open).toHaveBeenCalled();
  });

  it('should open on confirm message', () => {
    windowService.confirm('organisationDetails');
    windowService.setLocalStorage('organisationDetails', userName);
    expect(windowService.getLocalStorage('organisationDetails')).toBe(userName);
  });

  it('should trigger alert', () => {
    spyOn(windowService, 'alert');
    windowService.alert('test');
    expect(windowService.alert).toHaveBeenCalled();
  });
});
