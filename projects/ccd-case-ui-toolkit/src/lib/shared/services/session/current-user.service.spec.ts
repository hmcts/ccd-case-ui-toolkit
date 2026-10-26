import { of } from 'rxjs';
import { CurrentUserService } from './current-user.service';
import { SessionStorageService } from './session-storage.service';
import { UserDetails } from '../../domain/user/user-details.model';
import { UserInfo } from '../../domain/user/user-info.model';

describe('CurrentUserService', () => {
  const storage = jasmine.createSpyObj<SessionStorageService>('SessionStorageService', ['getItem', 'setItem']);

  beforeEach(() => storage.getItem.calls.reset());

  it('reads UserInfo from the legacy session key', () => {
    storage.getItem.and.returnValue('{"id":"user-1","roles":["caseworker"]}');
    const service = new CurrentUserService(storage);

    expect(service.getUserInfo()).toEqual(jasmine.objectContaining({ id: 'user-1' }));
    expect(storage.getItem).toHaveBeenCalledWith('userDetails');
  });

  it('returns null for absent, malformed, or non-object session data', () => {
    const service = new CurrentUserService(storage);
    for (const value of [null, '{bad', 'null', '[]', '"text"']) {
      storage.getItem.and.returnValue(value);
      expect(service.getUserInfo()).toBeNull();
    }
  });

  it('writes UserInfo under the legacy key and validates stored JSON', () => {
    const userInfo = { id: 'user-1', roles: [] } as UserInfo;
    const service = new CurrentUserService(storage);
    service.setUserInfo(userInfo);
    expect(storage.setItem).toHaveBeenCalledWith('userDetails', JSON.stringify(userInfo));

    storage.getItem.and.returnValue('{bad');
    expect(CurrentUserService.isStoredUserInfoValid(storage)).toBe(false);
    storage.getItem.and.returnValue(null);
    expect(CurrentUserService.isStoredUserInfoValid(storage)).toBe(true);
  });

  it('keeps sensitive identity fields out of session storage while retaining the current token in memory', () => {
    const userInfo = {
      id: 'user-1', email: 'user@example.com', roles: [],
      token: 'Bearer secret', iss: 'issuer', ssoProvider: 'provider', sub: 'subject', subname: 'subject name'
    } as UserInfo;

    CurrentUserService.writeUserInfo(storage, userInfo);
    const storedUserInfo = JSON.parse(storage.setItem.calls.mostRecent().args[1]);
    storage.getItem.and.returnValue(JSON.stringify(storedUserInfo));

    expect(storedUserInfo).toEqual({ id: 'user-1', email: 'user@example.com', roles: [] });
    expect(userInfo.token).toBe('Bearer secret');
    expect(CurrentUserService.getTransientToken(storage)).toBe('Bearer secret');

    storage.getItem.and.returnValue('{"id":"another-user"}');
    expect(CurrentUserService.getTransientToken(storage)).toBeNull();
  });

  it('stores and reads role assignments with the session user', () => {
    const details = {
      userInfo: { id: 'user-2', email: 'user@example.com', roles: [], token: 'Bearer secret' },
      canShareCases: true,
      sessionTimeout: { idleModalDisplayTime: 10, totalIdleTime: 30 },
      roleAssignmentInfo: [{ jurisdiction: 'IA', isCaseAllocator: true }]
    } as UserDetails;

    CurrentUserService.setUserDetails(storage, details);
    const storedUserInfo = storage.setItem.calls.mostRecent().args[1];
    storage.getItem.and.returnValue(storedUserInfo);

    expect(JSON.parse(storedUserInfo).roleAssignmentInfo).toEqual(details.roleAssignmentInfo);
    expect(CurrentUserService.readUserInfo(storage)).toEqual({ id: 'user-2', email: 'user@example.com', roles: [] } as UserInfo);
    expect(CurrentUserService.readUserDetails(storage)).toEqual({
      ...details,
      userInfo: { id: 'user-2', email: 'user@example.com', roles: [] }
    });
    expect(storedUserInfo).not.toContain('Bearer secret');
  });

  it('prefers id, falls back to uid, and handles a missing identity', () => {
    storage.getItem.and.returnValue('{"id":"id-1","uid":"uid-1"}');
    expect(CurrentUserService.readUserId(storage)).toBe('id-1');
    storage.getItem.and.returnValue('{"uid":"uid-1"}');
    expect(CurrentUserService.readUserId(storage)).toBe('uid-1');
    storage.getItem.and.returnValue(null);
    expect(CurrentUserService.readUserId(storage)).toBeNull();
  });

  it('exposes the full store response and its UserInfo separately', (done) => {
    const details = { userInfo: { id: 'user-1', roles: [] } } as UserDetails;
    const service = new CurrentUserService(storage, of(details));

    service.getUserDetails().subscribe((result) => expect(result).toBe(details));
    service.getUserInfo$().subscribe((result) => {
      expect(result).toBe(details.userInfo);
      done();
    });
  });
});
