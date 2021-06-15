import { Observable } from 'rxjs';
import { ManagerOptions, Socket, SocketOptions } from 'socket.io-client';

import { SessionStorageService } from '../session/session-storage.service';
import { ActivitySocketService } from './activity-socket.service';

describe('ActivitySocketService', () => {
  const MOCK_USER = { id: 'abcdefg123456', forename: 'Bob', surname: 'Smith' };
  let service: ActivitySocketService;
  let sessionStorageService: any;

  beforeEach(() => {
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(MOCK_USER));
    service = new ActivitySocketService(sessionStorageService);
  });

  it('should be created and have instantiated the socket', () => {
    expect(service).toBeTruthy();
    expect(service.socket instanceof Socket).toBeTruthy();
    expect(service.socket.io.opts.query.user).toEqual(MOCK_USER);

    // Should have set up the default location to be the same as the current URL.
    expect(service.socket.io.opts.path).toEqual('/socket.io');
    expect(service.socket.io.opts.hostname).toEqual(window.location.hostname);
    expect(service.socket.io.opts.port).toEqual(window.location.port);
  });

  it('should have set up socket connections', () => {
    expect(service.connect instanceof Observable).toBeTruthy();
    expect(service.activity instanceof Observable).toBeTruthy();
    expect(service.disconnect instanceof Observable).toBeTruthy();
    expect(service.connectionError instanceof Observable).toBeTruthy();
  });

  describe('socket behaviour', () => {
    it('should be connected', async (done) => {
      let connectFired = false;
      let activityFired = false;
      service.connect.subscribe((_) => {
        connectFired = true;
      });
      service.activity.subscribe((_) => {
        activityFired = true;
      });
      setTimeout(() => {
        expect(connectFired).toBeTruthy('connect did not fire');
        expect(activityFired).toBeFalsy('activity fired');
        done();
      }, 100);
    });
  });

});
