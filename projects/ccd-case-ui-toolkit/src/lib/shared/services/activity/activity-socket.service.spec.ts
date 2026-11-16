import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import {
  OnConnectedArgs,
  OnDisconnectedArgs,
  OnServerDataMessageArgs,
  WebPubSubClient
} from '@azure/web-pubsub-client';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import { CaseActivityInfo } from '../../domain/activity';
import { StructuredLoggerService } from '../logging';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivitySocketService } from './activity-socket.service';
import { MODES } from './utils';

describe('ActivitySocketService', () => {
  const MOCK_USER = { id: 'abcdefg123456', forename: 'Bob', surname: 'Smith', token: 'secret' };
  const CONNECTED_EVENT: OnConnectedArgs = { connectionId: 'connection-1', userId: MOCK_USER.id };
  let service: ActivitySocketService;
  let modeSubject: BehaviorSubject<MODES>;
  let sessionStorageService: jasmine.SpyObj<SessionStorageService>;
  let activityService: any;
  let eventHandlers: Record<string, Array<(event?: any) => void>>;
  let startSpy: jasmine.Spy;
  let stopSpy: jasmine.Spy;
  let sendEventSpy: jasmine.Spy;

  function resetSharedClient(): void {
    const state = (ActivitySocketService as any).sharedState;
    state.cancelReconnectWait?.();
    if (state.pageExitHandler) {
      window.removeEventListener('beforeunload', state.pageExitHandler);
      window.removeEventListener('pagehide', state.pageExitHandler);
    }
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
    }
    if (state.restartTimer) {
      clearTimeout(state.restartTimer);
    }
    state.client = undefined;
    state.userKey = undefined;
    state.connected = false;
    state.disconnectedAt = undefined;
    state.startPromise = undefined;
    state.closeTimer = undefined;
    state.restartTimer = undefined;
    state.activeCaseId = undefined;
    state.activeActivity = undefined;
    state.desiredCaseId = undefined;
    state.desiredActivity = undefined;
    state.pageExitHandler = undefined;
    state.owners.clear();
  }

  function trigger(event: string, payload?: any): void {
    (eventHandlers[event] || []).slice().forEach((handler) => handler(payload));
  }

  beforeEach(() => {
    resetSharedClient();
    eventHandlers = {};
    spyOn(WebPubSubClient.prototype, 'on').and.callFake((event: any, listener: any) => {
      eventHandlers[event] = eventHandlers[event] || [];
      eventHandlers[event].push(listener);
    });
    startSpy = spyOn(WebPubSubClient.prototype, 'start').and.returnValue(Promise.resolve());
    stopSpy = spyOn(WebPubSubClient.prototype, 'stop');
    sendEventSpy = spyOn(WebPubSubClient.prototype, 'sendEvent')
      .and.returnValue(Promise.resolve({ ackId: 1, isDuplicated: false }));

    sessionStorageService = jasmine.createSpyObj<SessionStorageService>('sessionStorageService', ['getItem']);
    sessionStorageService.getItem.and.returnValue(JSON.stringify(MOCK_USER));
    modeSubject = new BehaviorSubject<MODES>(undefined);
    activityService = {
      isEnabled: true,
      pMode: undefined,
      modeSubject,
      negotiateWebPubSubConnection: jasmine.createSpy('negotiateWebPubSubConnection')
        .and.returnValue(of({ url: 'wss://example.webpubsub.azure.com/client/hubs/hub?access_token=token' })),
      get mode(): MODES {
        return activityService.pMode;
      },
      set mode(value: MODES) {
        if (value !== activityService.pMode) {
          activityService.pMode = value;
          modeSubject.next(value);
        }
      }
    };
    service = new ActivitySocketService(sessionStorageService, activityService);
  });

  afterEach(() => {
    service.ngOnDestroy();
    resetSharedClient();
  });

  it('should be created without opening a client by default', () => {
    expect(service).toBeTruthy();
    expect(service.socket).toBeUndefined();
    expect(startSpy).not.toHaveBeenCalled();
  });

  it('should not open Web PubSub for off or polling modes', () => {
    activityService.mode = MODES.off;
    activityService.mode = MODES.polling;

    expect(service.socket).toBeUndefined();
    expect(startSpy).not.toHaveBeenCalled();
  });

  [MODES.socket, MODES.socketLongPoll].forEach((mode) => {
    it(`should use Web PubSub while retaining the "${mode}" mode value`, () => {
      activityService.mode = mode;

      expect(service.socket instanceof WebPubSubClient).toBeTruthy();
      expect(startSpy).toHaveBeenCalledTimes(1);
      expect(service.connect instanceof Observable).toBeTruthy();
      expect(service.disconnect instanceof Observable).toBeTruthy();
      expect(service.activity instanceof Observable).toBeTruthy();
    });
  });

  it('should disable SDK ping/pong frames while retaining automatic reconnection', () => {
    activityService.mode = MODES.socket;

    const clientOptions = (service.socket as any)._options;
    expect(clientOptions.keepAliveIntervalInMs).toBe(0);
    expect(clientOptions.keepAliveTimeoutInMs).toBe(0);
    expect(clientOptions.autoReconnect).toBe(true);
    expect(clientOptions.reconnectRetryOptions.maxRetries).toBe(10);
    expect(clientOptions.reconnectRetryOptions.retryDelayInMs).toBe(0);
    expect((service.socket as any)._protocol.isReliableSubProtocol).toBeTrue();
  });

  it('should negotiate a client access URL through ActivityService', async () => {
    activityService.mode = MODES.socket;

    const credential = (service.socket as any)._credential;
    const url = await credential.getClientAccessUrl();

    expect(url).toBe('wss://example.webpubsub.azure.com/client/hubs/hub?access_token=token');
    expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
  });

  it('should expose the current user without its token', () => {
    expect(service.user).toEqual({ id: MOCK_USER.id, forename: 'Bob', surname: 'Smith' } as any);
  });

  it('should register page-exit handling for beforeunload and pagehide', () => {
    const addEventListenerSpy = spyOn(window, 'addEventListener').and.callThrough();

    activityService.mode = MODES.socket;

    const pageExitHandler = (ActivitySocketService as any).sharedState.pageExitHandler;
    expect(addEventListenerSpy).toHaveBeenCalledWith('beforeunload', pageExitHandler);
    expect(addEventListenerSpy).toHaveBeenCalledWith('pagehide', pageExitHandler);
  });

  it('should update connection observables from Web PubSub lifecycle events', () => {
    activityService.mode = MODES.socket;
    let connectedEvent: OnConnectedArgs;
    let disconnectedEvent: OnDisconnectedArgs;
    service.connect.subscribe((event) => connectedEvent = event);
    service.disconnect.subscribe((event) => disconnectedEvent = event);

    trigger('connected', CONNECTED_EVENT);
    expect(service.connected.value).toBeTruthy();
    expect(connectedEvent).toEqual(CONNECTED_EVENT);
    expect(service.user.uid).toBe(CONNECTED_EVENT.userId);

    const disconnect = { connectionId: CONNECTED_EVENT.connectionId };
    trigger('disconnected', disconnect);
    expect(service.connected.value).toBeFalsy();
    expect(disconnectedEvent).toEqual(disconnect);
  });

  it('should publish activity arrays received in Web PubSub server messages', () => {
    activityService.mode = MODES.socket;
    const activity = [{ caseId: 'case-1', viewers: [], editors: [] }] as CaseActivityInfo[];
    let received: CaseActivityInfo[];
    service.activity.subscribe((value) => received = value);

    trigger('server-message', {
      message: {
        kind: 'serverData',
        dataType: 'json',
        data: { event: 'activity', data: activity }
      }
    } as OnServerDataMessageArgs);

    expect(received).toEqual(activity);
  });

  it('should parse string Web PubSub server messages and ignore unrelated events', () => {
    activityService.mode = MODES.socket;
    const activity = [{ caseId: 'case-1', viewers: [], editors: [] }] as CaseActivityInfo[];
    const received: CaseActivityInfo[][] = [];
    service.activity.subscribe((value) => received.push(value));

    trigger('server-message', {
      message: { kind: 'serverData', dataType: 'json', data: JSON.stringify({ event: 'ignored', data: activity }) }
    });
    trigger('server-message', {
      message: { kind: 'serverData', dataType: 'json', data: JSON.stringify({ event: 'activity', data: activity }) }
    });

    expect(received).toEqual([activity]);
  });

  it('should publish each latest activity update received as a Web PubSub group message', () => {
    activityService.mode = MODES.socket;
    const viewActivity = [{
      caseId: 'case-1',
      viewers: [{ id: 'viewer-1', forename: 'View', surname: 'User' }],
      unknownViewers: 0,
      editors: [],
      unknownEditors: 0
    }] as CaseActivityInfo[];
    const editActivity = [{
      caseId: 'case-1',
      viewers: [],
      unknownViewers: 0,
      editors: [{ id: 'editor-1', forename: 'Edit', surname: 'User' }],
      unknownEditors: 0
    }] as CaseActivityInfo[];
    const received: CaseActivityInfo[][] = [];
    service.activity.subscribe((value) => received.push(value));

    trigger('group-message', {
      message: {
        kind: 'groupData',
        group: 'case:case-1',
        dataType: 'json',
        data: { event: 'activity', data: viewActivity }
      }
    });
    trigger('group-message', {
      message: {
        kind: 'groupData',
        group: 'case:case-1',
        dataType: 'json',
        data: { event: 'activity', data: editActivity }
      }
    });

    expect(received).toEqual([viewActivity, editActivity]);
  });

  describe('activity events', () => {
    beforeEach(() => {
      activityService.mode = MODES.socket;
      trigger('connected', CONNECTED_EVENT);
    });

    it('should send watch through Web PubSub', () => {
      service.watchCases(['case-1', 'case-2']);

      expect(sendEventSpy).toHaveBeenCalledWith(
        'watch',
        { caseIds: ['case-1', 'case-2'] },
        'json'
      );
    });

    it('should send view through Web PubSub', () => {
      service.viewCase('case-1', true);

      expect(sendEventSpy).toHaveBeenCalledWith('view', { caseId: 'case-1' }, 'json');
    });

    it('should send edit through Web PubSub', () => {
      service.editCase('case-1', true);

      expect(sendEventSpy).toHaveBeenCalledWith('edit', { caseId: 'case-1' }, 'json');
    });

    it('should send stop through Web PubSub', () => {
      service.stopCase('case-1', true);

      expect(sendEventSpy).toHaveBeenCalledWith('stop', { caseId: 'case-1' }, 'json');
    });

    it('should send stopAll through Web PubSub', () => {
      service.stopAllCase(['case-1', 'case-2'], true);

      expect(sendEventSpy).toHaveBeenCalledWith(
        'stopAll',
        { caseIds: ['case-1', 'case-2'] },
        'json'
      );
    });

    it('should log view, edit, stop and stopAll events sent to the backend', () => {
      const consoleLogSpy = spyOn(console, 'log');

      service.viewCase('case-1', true);
      service.editCase('case-1', true);
      service.stopCase('case-1', true);
      service.stopAllCase(['case-1', 'case-2'], true);

      expect(consoleLogSpy.calls.allArgs()).toEqual([
        ['[Case activity] Sending \'view\' event', { caseId: 'case-1' }],
        ['[Case activity] Sending \'edit\' event', { caseId: 'case-1' }],
        ['[Case activity] Sending \'stop\' event', { caseId: 'case-1' }],
        ['[Case activity] Sending \'stopAll\' event', { caseIds: ['case-1', 'case-2'] }]
      ]);
    });

    it('should not send activity events while disconnected', () => {
      trigger('disconnected', { connectionId: CONNECTED_EVENT.connectionId });

      service.watchCases(['case-1']);
      service.startViewing('case-1');
      service.startEditing('case-1');
      service.stopViewing('case-1');
      service.stopViewingCases(['case-1']);

      expect(sendEventSpy).not.toHaveBeenCalled();
    });

    it('should suppress duplicate view and edit events during the cooldown', () => {
      service.startViewing('case-1');
      service.startViewing('case-1');
      service.startEditing('case-1');
      service.startEditing('case-1');

      expect(sendEventSpy.calls.allArgs()).toEqual([
        ['view', { caseId: 'case-1' }, 'json'],
        ['edit', { caseId: 'case-1' }, 'json']
      ]);
    });

    it('should send one fire-and-forget stop before unload and ignore the later pagehide', () => {
      const consoleLogSpy = spyOn(console, 'log');
      service.startViewing('case-1');
      service.startEditing('case-2');
      sendEventSpy.calls.reset();
      consoleLogSpy.calls.reset();

      (ActivitySocketService as any).sharedState.pageExitHandler();
      window.dispatchEvent(new Event('pagehide'));

      expect(sendEventSpy.calls.allArgs()).toEqual([
        ['stop', { caseId: 'case-2' }, 'json', { fireAndForget: true }]
      ]);
      expect(consoleLogSpy).toHaveBeenCalledTimes(1);
      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[Case activity] Sending \'stop\' event during page exit',
        { caseId: 'case-2' }
      );
    });

    it('should use pagehide as a fallback when beforeunload does not fire', () => {
      service.startViewing('case-1');
      sendEventSpy.calls.reset();

      window.dispatchEvent(new Event('pagehide'));

      expect(sendEventSpy).toHaveBeenCalledWith(
        'stop',
        { caseId: 'case-1' },
        'json',
        { fireAndForget: true }
      );
    });

    it('should not send a page-close stop after the active case has already stopped', () => {
      service.startViewing('case-1');
      service.stopViewing('case-1');
      sendEventSpy.calls.reset();

      window.dispatchEvent(new Event('pagehide'));

      expect(sendEventSpy).not.toHaveBeenCalled();
    });

    it('should keep the current activity active when the page loses visibility', () => {
      let visibilityState: DocumentVisibilityState = 'visible';
      spyOnProperty(document, 'visibilityState', 'get').and.callFake(() => visibilityState);
      service.startViewing('case-1');
      sendEventSpy.calls.reset();

      visibilityState = 'hidden';
      document.dispatchEvent(new Event('visibilitychange'));
      expect(sendEventSpy).not.toHaveBeenCalled();

      visibilityState = 'visible';
      document.dispatchEvent(new Event('visibilitychange'));
      expect(sendEventSpy).not.toHaveBeenCalled();
    });

    it('should send view and edit activity even when the page is hidden', () => {
      spyOnProperty(document, 'visibilityState', 'get').and.returnValue('hidden');

      service.startViewing('case-1');
      service.startEditing('case-2');

      expect(sendEventSpy.calls.allArgs()).toEqual([
        ['view', { caseId: 'case-1' }, 'json'],
        ['edit', { caseId: 'case-2' }, 'json']
      ]);
    });
  });

  it('should reuse one shared Web PubSub client across service instances', () => {
    activityService.mode = MODES.socket;
    const secondService = new ActivitySocketService(sessionStorageService, activityService);

    expect(secondService.socket).toBe(service.socket);
    expect(startSpy).toHaveBeenCalledTimes(1);

    secondService.ngOnDestroy();
  });

  it('should close the shared client after the final owner grace period', fakeAsync(() => {
    activityService.mode = MODES.socket;

    service.ngOnDestroy();
    tick(4999);
    expect(stopSpy).not.toHaveBeenCalled();

    tick(1);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  }));

  it('should reuse the shared client when an owner appears during the close grace period', fakeAsync(() => {
    activityService.mode = MODES.socket;
    const firstClient = service.socket;
    service.ngOnDestroy();
    tick(4999);

    const secondService = new ActivitySocketService(sessionStorageService, activityService);
    expect(secondService.socket).toBe(firstClient);

    tick(1);
    expect(stopSpy).not.toHaveBeenCalled();

    secondService.ngOnDestroy();
    tick(5000);
    expect(stopSpy).toHaveBeenCalledTimes(1);
  }));

  it('should surface initial connection errors and retry the shared client', fakeAsync(() => {
    spyOn(Math, 'random').and.returnValue(0);
    startSpy.and.callFake(() => (service.socket as any)._credential.getClientAccessUrl().then(() => undefined));
    activityService.negotiateWebPubSubConnection.and.returnValues(
      throwError(() => new Error('unavailable')),
      of({ url: 'wss://example.webpubsub.azure.com/client/hubs/hub' })
    );
    let receivedError: unknown;
    service.connect_error.subscribe((error) => receivedError = error);

    activityService.mode = MODES.socket;
    flushMicrotasks();

    expect((receivedError as Error).message).toBe('unavailable');
    expect(startSpy).toHaveBeenCalledTimes(1);

    tick(999);
    expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
    tick(1);
    expect(startSpy).toHaveBeenCalledTimes(2);
    expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(2);
    flushMicrotasks();
  }));

  describe('random reconnection delay', () => {
    beforeEach(() => {
      // Exercise the real credential callback without opening an external WebSocket.
      startSpy.and.callFake(() => (service.socket as any)._credential.getClientAccessUrl().then(() => undefined));
    });

    [
      { random: 0, delayMs: 1000 },
      { random: 0.5, delayMs: 10500 },
      { random: 0.999999, delayMs: 20000 }
    ].forEach(({ random, delayMs }) => {
      it(`should delay backend negotiation by ${delayMs}ms and log matching timing details`, fakeAsync(() => {
        spyOn(Math, 'random').and.returnValue(random);
        const debugSpy = spyOn(StructuredLoggerService.prototype, 'debug');
        const logSpy = spyOn(console, 'log');
        activityService.mode = MODES.socket;
        flushMicrotasks();
        expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
        trigger('connected', CONNECTED_EVENT);
        const disconnectedAt = Date.now();
        trigger('disconnected', CONNECTED_EVENT);
        trigger('stopped');
        trigger('stopped');
        tick(0);

        const scheduledMessage = `Activity socket reconnect scheduled in ${delayMs}ms.`;
        const timing = {
          scheduledAt: new Date(disconnectedAt).toISOString(),
          reconnectAt: new Date(disconnectedAt + delayMs).toISOString(),
          delayMs
        };
        expect(logSpy).toHaveBeenCalledWith(scheduledMessage, timing);
        expect(debugSpy).toHaveBeenCalledWith(scheduledMessage, timing);
        tick(delayMs - 1);
        expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
        tick(1);
        expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(2);
        const attemptMessage = `Activity socket reconnect attempt after ${delayMs}ms scheduled delay.`;
        const attemptedTiming = {
          ...timing,
          attemptedAt: new Date(disconnectedAt + delayMs).toISOString(),
          actualDelayMs: delayMs
        };
        expect(logSpy).toHaveBeenCalledWith(attemptMessage, attemptedTiming);
        expect(debugSpy).toHaveBeenCalledWith(attemptMessage, attemptedTiming);
        trigger('connected', CONNECTED_EVENT);
        expect(service.connected.value).toBeTrue();
        expect(debugSpy).toHaveBeenCalledWith(
          `Activity socket reconnected using Web PubSub after ${delayMs}ms total downtime.`,
          {
            disconnectedAt: new Date(disconnectedAt).toISOString(),
            reconnectedAt: new Date(disconnectedAt + delayMs).toISOString(),
            elapsedMs: delayMs
          }
        );
      }));
    });

    it('should apply fresh jitter to SDK retries without waiting for a stopped event', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValues(0, 0.999999);
      activityService.mode = MODES.socket;
      flushMicrotasks();
      const credential = (service.socket as any)._credential;
      let completed = 0;

      credential.getClientAccessUrl().then(() => completed++);
      tick(999);
      expect(completed).toBe(0);
      tick(1);
      expect(completed).toBe(1);

      credential.getClientAccessUrl().then(() => completed++);
      tick(19999);
      expect(completed).toBe(1);
      tick(1);
      expect(completed).toBe(2);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(3);
    }));

    it('should choose a new delay after each failed restart', fakeAsync(() => {
      const randomSpy = spyOn(Math, 'random').and.returnValues(0, 0.999999);
      activityService.negotiateWebPubSubConnection.and.returnValues(
        of({ url: 'wss://example.webpubsub.azure.com/client/hubs/hub' }),
        throwError(() => new Error('unavailable')),
        of({ url: 'wss://example.webpubsub.azure.com/client/hubs/hub' })
      );
      activityService.mode = MODES.socket;
      flushMicrotasks();
      trigger('stopped');
      tick(1000);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(2);
      expect(randomSpy).toHaveBeenCalledTimes(2);
      tick(19999);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(2);
      tick(1);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(3);
    }));

    it('should keep one pending retry when a second service attaches', fakeAsync(() => {
      const randomSpy = spyOn(Math, 'random').and.returnValue(0);
      activityService.mode = MODES.socket;
      flushMicrotasks();
      trigger('stopped');
      tick(0);
      const secondService = new ActivitySocketService(sessionStorageService, activityService);

      tick(1000);

      expect(secondService.socket).toBe(service.socket);
      expect(randomSpy).toHaveBeenCalledTimes(1);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(2);
      secondService.ngOnDestroy();
    }));

    it('should cancel a pending delay when the last owner closes', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0.999999);
      activityService.mode = MODES.socket;
      flushMicrotasks();
      trigger('stopped');
      tick(0);

      service.ngOnDestroy();
      tick(20000);

      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
      expect(stopSpy).toHaveBeenCalledTimes(1);
      expect((ActivitySocketService as any).sharedState.cancelReconnectWait).toBeUndefined();
    }));

    it('should not negotiate if the last owner leaves before the delay expires', fakeAsync(() => {
      spyOn(Math, 'random').and.returnValue(0);
      activityService.mode = MODES.socket;
      flushMicrotasks();
      trigger('stopped');
      tick(0);

      service.ngOnDestroy();
      tick(1000);
      expect(activityService.negotiateWebPubSubConnection).toHaveBeenCalledTimes(1);
      tick(4000);
    }));
  });
});
