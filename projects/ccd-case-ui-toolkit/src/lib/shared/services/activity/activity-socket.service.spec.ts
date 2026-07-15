import { fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject, Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { CaseActivityInfo } from '../../domain/activity';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivitySocketService } from './activity-socket.service';
import { MODES, Utils } from './utils';

describe('ActivitySocketService', () => {
  const MOCK_USER = { id: 'abcdefg123456', forename: 'Bob', surname: 'Smith' };
  let service: ActivitySocketService;
  let mockModeSubject: BehaviorSubject<MODES>;
  let sessionStorageService: any;
  let activityService: any;

  function resetSharedSocket(): void {
    const sharedState = (ActivitySocketService as any).sharedState;
    if (sharedState.socket) {
      sharedState.socket.close();
    }
    sharedState.socket = undefined;
    sharedState.allowWebSockets = undefined;
    sharedState.userKey = undefined;
    sharedState.connectRequested = undefined;
    if (sharedState.closeTimer) {
      clearTimeout(sharedState.closeTimer);
      sharedState.closeTimer = undefined;
    }
    sharedState.owners.clear();
  }

  function createMockSocket(): any {
    const handlers: { [event: string]: Array<(payload?: any) => void> } = {};
    const socket: any = {
      active: false,
      connected: false,
      io: { _readyState: 'closed', opts: {} },
      emit: jasmine.createSpy('emit'),
      on: jasmine.createSpy('on').and.callFake((event: string, handler: (payload?: any) => void) => {
        handlers[event] = handlers[event] || [];
        handlers[event].push(handler);
        return socket;
      }),
      off: jasmine.createSpy('off').and.callFake((event: string, handler: (payload?: any) => void) => {
        handlers[event] = (handlers[event] || []).filter(item => item !== handler);
        return socket;
      }),
      close: jasmine.createSpy('close').and.callFake(() => {
        socket.active = false;
        socket.connected = false;
        socket.io._readyState = 'closed';
        return socket;
      }),
      connect: jasmine.createSpy('connect').and.callFake(() => {
        socket.active = true;
        socket.io._readyState = 'opening';
        return socket;
      }),
      disconnect: jasmine.createSpy('disconnect').and.callFake(() => {
        socket.active = false;
        socket.connected = false;
        socket.io._readyState = 'closed';
        return socket;
      }),
      trigger: (event: string, payload?: any) => {
        (handlers[event] || []).slice().forEach(handler => handler(payload));
      }
    };
    return socket;
  }

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

  afterEach(() => {
    (service as any).destroy();
    resetSharedSocket();
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
      expect(service.socket.auth).toEqual({ user: MOCK_USER });
      expect(service.socket.io.opts.query).toBeUndefined();

      // Should have set up the default location to be the same as the current URL.
      expect(service.socket.io.opts.path).toEqual('/socket.io');
      expect((service.socket.io as any).uri).toEqual(`${window.location.protocol}//${window.location.host}`);
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

  describe('socket connection lifecycle', () => {
    let getSocketSpy: jasmine.Spy;
    let mockSocket: any;

    beforeEach(() => {
      (service as any).destroy();
      resetSharedSocket();
      mockSocket = createMockSocket();
      getSocketSpy = spyOn(Utils, 'getSocket').and.returnValue(mockSocket as Socket);
    });

    it('should reuse an active shared socket instead of opening another connection', () => {
      activityService.mode = MODES.socket;
      const firstSocket = service.socket;

      const secondService = new ActivitySocketService(sessionStorageService, activityService);

      expect(secondService.socket).toBe(firstSocket);
      expect(getSocketSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      (secondService as any).destroy();
    });

    it('should not open another socket while the first connect request is pending', () => {
      mockSocket.connect.and.callFake(() => mockSocket);

      activityService.mode = MODES.socket;
      const firstSocket = service.socket;

      const secondService = new ActivitySocketService(sessionStorageService, activityService);

      expect(secondService.socket).toBe(firstSocket);
      expect(getSocketSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);

      (secondService as any).destroy();
    });

    it('should unsubscribe from mode changes when Angular destroys the service', () => {
      activityService.mode = MODES.socket;

      service.ngOnDestroy();

      activityService.mode = MODES.socketLongPoll;

      expect(getSocketSpy).toHaveBeenCalledTimes(1);
      expect(service.socket).toBeUndefined();
    });

    it('should treat an open engine connection as active if the manager state is stale', () => {
      mockSocket.connected = false;
      mockSocket.active = false;
      mockSocket.io._readyState = 'closed';
      mockSocket.io.engine = { readyState: 'open' };

      expect((ActivitySocketService as any).isSocketActive(mockSocket)).toBe(true);
    });

    it('should close the shared socket after the last owner grace period', fakeAsync(() => {
      activityService.mode = MODES.socket;
      const firstSocket = service.socket;

      const secondService = new ActivitySocketService(sessionStorageService, activityService);
      (secondService as any).destroy();

      expect(service.socket).toBe(firstSocket);
      expect(mockSocket.close).not.toHaveBeenCalled();

      (service as any).destroy();

      expect(mockSocket.close).not.toHaveBeenCalled();

      tick(4999);
      expect(mockSocket.close).not.toHaveBeenCalled();

      tick(1);
      expect(mockSocket.close).toHaveBeenCalledTimes(1);
    }));

    it('should reuse the shared socket when a new owner appears during the close grace period', fakeAsync(() => {
      activityService.mode = MODES.socket;
      const firstSocket = service.socket;

      (service as any).destroy();
      tick(4999);

      const secondService = new ActivitySocketService(sessionStorageService, activityService);

      expect(secondService.socket).toBe(firstSocket);
      expect(getSocketSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.close).not.toHaveBeenCalled();

      tick(1);
      expect(mockSocket.close).not.toHaveBeenCalled();

      (secondService as any).destroy();
      tick(5000);

      expect(mockSocket.close).toHaveBeenCalledTimes(1);
    }));

    it('should reuse and reconnect an owned shared socket when it becomes inactive', () => {
      activityService.mode = MODES.socket;
      const firstSocket = service.socket;
      mockSocket.active = false;
      mockSocket.connected = false;
      mockSocket.io._readyState = 'closed';
      (ActivitySocketService as any).clearSharedSocketConnectRequest(mockSocket);

      const nextSocket = createMockSocket();
      getSocketSpy.and.returnValue(nextSocket as Socket);

      const secondService = new ActivitySocketService(sessionStorageService, activityService);

      expect(secondService.socket).toBe(firstSocket);
      expect(getSocketSpy).toHaveBeenCalledTimes(1);
      expect(mockSocket.close).not.toHaveBeenCalled();
      expect(mockSocket.connect).toHaveBeenCalledTimes(2);
      expect(nextSocket.connect).not.toHaveBeenCalled();

      (secondService as any).destroy();
    });

    it('should leave websocket reconnects to Socket.IO after disconnect', () => {
      activityService.mode = MODES.socket;
      mockSocket.connected = true;
      mockSocket.active = true;
      mockSocket.io._readyState = 'open';

      mockSocket.trigger('disconnect');

      expect(service.connected.value).toBe(false);
      expect(mockSocket.disconnect).not.toHaveBeenCalled();
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    });

    it('should leave socket-long-poll reconnects to Socket.IO', fakeAsync(() => {
      activityService.mode = MODES.socketLongPoll;
      mockSocket.connected = true;
      mockSocket.active = true;
      mockSocket.io._readyState = 'open';

      mockSocket.trigger('disconnect');
      tick(2000);

      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    }));

    it('should not refresh watch while the websocket is idle', fakeAsync(() => {
      activityService.mode = MODES.socket;
      mockSocket.connected = true;
      mockSocket.active = true;
      mockSocket.io._readyState = 'open';

      const caseIds = ['case1', 'case2'];
      service.watchCases(caseIds);

      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
      expect(mockSocket.emit).toHaveBeenCalledWith('watch', { caseIds });

      tick(59999);
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);

      tick(1);
      expect(mockSocket.emit).toHaveBeenCalledTimes(1);
      expect(mockSocket.connect).toHaveBeenCalledTimes(1);
    }));
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

    it('should replay the latest activity payload to late subscribers', () => {
      const activityPayload = [{ caseId: 'case1', viewers: [], editors: [] }] as CaseActivityInfo[];
      let receivedActivity: CaseActivityInfo[];

      (service as any).activitySubject.next(activityPayload);

      service.activity.subscribe(activity => {
        receivedActivity = activity;
      });

      expect(receivedActivity).toEqual(activityPayload);
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

    it('stopAllCase should emit "stopAll" with the case IDs when connected', () => {
      spyOn(service.socket, 'emit');
      const caseIds = ['case-stop-1', 'case-stop-2'];

      service.stopAllCase(caseIds, true);

      expect(service.socket.emit).toHaveBeenCalledWith('stopAll', { caseIds });
    });

    it('stopAllCase should NOT emit when not connected', () => {
      spyOn(service.socket, 'emit');
      const caseIds = ['case-stop-1', 'case-stop-2'];
      service.connected.next(false);

      service.stopAllCase(caseIds, true);

      expect(service.socket.emit).not.toHaveBeenCalled();
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
