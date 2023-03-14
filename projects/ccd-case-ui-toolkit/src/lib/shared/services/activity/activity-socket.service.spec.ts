import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { SessionStorageService } from '../session/session-storage.service';
import { ActivitySocketService } from './activity-socket.service';
import { Utils, MODES } from './utils';

describe('ActivitySocketService', () => {
  const MOCK_USER = { id: 'abcdefg123456', forename: 'Bob', surname: 'Smith' };
  const MOCK_USER_STRING = JSON.stringify(MOCK_USER);
  let service: ActivitySocketService;
  let mockModeSubject: BehaviorSubject<MODES>;
  let sessionStorageService: any;
  let activityService: any;

  beforeEach(() => {
    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(MOCK_USER));
    mockModeSubject = new BehaviorSubject<MODES>(undefined);
    activityService = {
      pMode: undefined,
      modeSubject: mockModeSubject.asObservable(),
      get mode(): MODES {
        return activityService.pMode;
      },
      set mode(value: MODES) {
        if (value !== activityService.pMode) {
          activityService.pMode = value;
          mockModeSubject.next(value);
        }
      }
    };
    service = new ActivitySocketService(sessionStorageService, activityService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('when socket-like modes are not enabled', () => {

    it('should not have created a socket by default', () => {
      expect(service.socket).toBeUndefined();
    });
    it('should not have created a socket when mode is "off"', () => {
      activityService.mode = MODES.off;
      expect(service.socket).toBeUndefined();
    });
    it('should not have created a socket when mode is "polling"', () => {
      activityService.mode = MODES.polling;
      expect(service.socket).toBeUndefined();
    });

  });

  describe('when "socket-long-polling" mode is enabled', () => {

    beforeEach(() => {
      activityService.mode = MODES.socketLongPoll;
    });

    it('should have instantiated the socket', () => {
      expect(service.socket instanceof Socket).toBeTruthy();
      expect(service.socket.io.opts.query.user).toEqual(MOCK_USER_STRING);

      // Should have set up the default location to be the same as the current URL.
      expect(service.socket.io.opts.path).toEqual('/socket.io');
      expect(service.socket.io.opts.hostname).toEqual(window.location.hostname);
      expect(service.socket.io.opts.port).toEqual(window.location.port);
    });
    it('should have set up the correct transports', () => {
      // Should have set up the correct transports.
      expect(service.socket.io.opts.transports).toEqual(Utils.TRANSPORTS.disallowWebSockets);
    });
    it('should have set up socket connections', () => {
      expect(service.connect instanceof Observable).toBeTruthy();
      expect(service.activity instanceof Observable).toBeTruthy();
      expect(service.disconnect instanceof Observable).toBeTruthy();
    });
    it('should reinstantiate the socket and change transports when the socket mode changes', () => {
      const originalSocket = service.socket;
      activityService.mode = MODES.socket;
      const newSocket = service.socket;
      expect(newSocket instanceof Socket).toBeTruthy();
      expect(newSocket.io.opts.transports).toEqual(Utils.TRANSPORTS.allowWebSockets);
      expect(newSocket).not.toEqual(originalSocket);
    });
    it('should destroy connection when socket-like modes are disabled', () => {
      expect(service.socket instanceof Socket).toBeTruthy();
      activityService.mode = MODES.polling;
      expect(service.socket).toBeUndefined();
    });

  });

  describe('when "socket" mode is enabled', () => {

    beforeEach(() => {
      activityService.mode = MODES.socket;
    });

    it('should have instantiated the socket and set up the correct transports', () => {
      expect(service.socket instanceof Socket).toBeTruthy();
      expect(service.socket.io.opts.transports).toEqual(Utils.TRANSPORTS.allowWebSockets);
    });

    it('should reinstantiate the socket and change transports when the socket mode changes', () => {
      const originalSocket = service.socket;
      activityService.mode = MODES.socketLongPoll;
      const newSocket = service.socket;
      expect(newSocket instanceof Socket).toBeTruthy();
      expect(newSocket.io.opts.transports).toEqual(Utils.TRANSPORTS.disallowWebSockets);
      expect(newSocket).not.toEqual(originalSocket);
    });

    it('should destroy connection when socket-like modes are disabled', () => {
      expect(service.socket instanceof Socket).toBeTruthy();
      activityService.mode = MODES.polling;
      expect(service.socket).toBeUndefined();
    });

  });

});
