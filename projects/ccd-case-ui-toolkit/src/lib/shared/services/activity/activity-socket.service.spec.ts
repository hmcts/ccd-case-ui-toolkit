import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { SessionStorageService } from '../session/session-storage.service';
import { ActivitySocketService } from './activity-socket.service';
import { Utils, MODES } from './utils';
import { connect } from 'http2';
import { connected } from 'process';

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
    it('should have set up socket connections', () => {
      expect(service.connect instanceof Observable).toBeTruthy();
      expect(service.activity instanceof Observable).toBeTruthy();
      expect(service.disconnect instanceof Observable).toBeTruthy();
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

    it('should destroy connection when socket-like modes are disabled', () => {
      expect(service.socket instanceof Socket).toBeTruthy();
      activityService.mode = MODES.polling;
      expect(service.socket).toBeUndefined();
    });
  });

  describe('watchCases', () => {
    beforeEach(() => {
      activityService.mode = MODES.socket;
    });
    it('should emit a "watch" event with the case IDs', () => {
      spyOn(service.socket, 'emit');
      const caseIds = ['case1', 'case2', 'case3'];
      service.watchCases(caseIds);
      expect(service.socket.emit).toHaveBeenCalledWith('watch', { caseIds });
    });
  });

  describe('viewCase', () => {
    beforeEach(() => {
      activityService.mode = MODES.socket;
    });
  it('should emit a "view" event with the case ID', () => {
      spyOn(service.socket, 'emit');
      service.connected.next(true);

      const caseId = 'case42';
      service.viewCase(caseId, true);
      expect(service.socket.emit).toHaveBeenCalledWith('view', { caseId });
    });
  });

  describe('editCase', () => {
    beforeEach(() => {
      activityService.mode = MODES.socket;
    });
    it('should emit an "edit" event with the case ID', () => {
      spyOn(service.socket, 'emit');
      service.connected.next(true);
      
      const caseId = 'case42';
      service.editCase(caseId, true);
      expect(service.socket.emit).toHaveBeenCalledWith('edit', { caseId });
    });
  });

  describe('explicit start/stop methods (startViewing, stopViewing, startEditing)', () => {
    beforeEach(() => {
      activityService.mode = MODES.socket;
      // mark socket as connected so guarded emits pass
      service.connected.next(true);
    });

    it('startViewing should emit "view" when connected', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-view-1';

      service.startViewing(caseId);

      expect(service.socket.emit).toHaveBeenCalledWith('view', { caseId });
    });

    it('startViewing should NOT emit when not connected', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-view-2';
      // disconnect the service
      service.connected.next(false);

      service.startViewing(caseId);

      expect(service.socket.emit).not.toHaveBeenCalled();
    });

    it('startViewing should dedupe duplicates when a recent emit exists', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-view-3';
      // simulate a very recent emit for same caseId
      (service as any).lastViewEmit = { caseId, time: Date.now() };

      service.startViewing(caseId);

      // blocked by cooldown so no new emit
      expect(service.socket.emit).not.toHaveBeenCalled();
    });

    it('stopViewing should emit "stop" when connected and clear lastViewEmit', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-stop-1';
      // set lastViewEmit so we can verify it's cleared
      (service as any).lastViewEmit = { caseId, time: Date.now() };

      service.stopViewing(caseId);

      expect(service.socket.emit).toHaveBeenCalledWith('stop', { caseId });
      // lastViewEmit for that case cleared
      expect((service as any).lastViewEmit.caseId).toBe('');
    });

    it('startEditing should emit "edit" when connected', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-edit-1';

      service.startEditing(caseId);

      expect(service.socket.emit).toHaveBeenCalledWith('edit', { caseId });
    });

    it('startEditing should dedupe duplicate edit emits when recent', () => {
      spyOn(service.socket, 'emit');
      const caseId = 'case-edit-2';
      // simulate recent edit emit
      (service as any).lastEditEmit = { caseId, time: Date.now() };

      service.startEditing(caseId);

      expect(service.socket.emit).not.toHaveBeenCalled();
    });
  });
});
