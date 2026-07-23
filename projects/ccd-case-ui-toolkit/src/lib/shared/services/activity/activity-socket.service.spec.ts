import { fakeAsync, flushMicrotasks, tick } from '@angular/core/testing';
import {
  OnConnectedArgs,
  OnDisconnectedArgs,
  OnServerDataMessageArgs,
  WebPubSubClient
} from '@azure/web-pubsub-client';
import { BehaviorSubject, Observable, of } from 'rxjs';

import { CaseActivityInfo } from '../../domain/activity';
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
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
    }
    if (state.restartTimer) {
      clearTimeout(state.restartTimer);
    }
    state.client = undefined;
    state.userKey = undefined;
    state.connected = false;
    state.startPromise = undefined;
    state.closeTimer = undefined;
    state.restartTimer = undefined;
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
    sendEventSpy = spyOn(WebPubSubClient.prototype, 'sendEvent').and.returnValue(Promise.resolve({ ackId: 1 }));

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

  it('should update connection observables from Web PubSub lifecycle events', () => {
    activityService.mode = MODES.socket;
    let connectedEvent: OnConnectedArgs;
    let disconnectedEvent: OnDisconnectedArgs;
    service.connect.subscribe((event) => connectedEvent = event);
    service.disconnect.subscribe((event) => disconnectedEvent = event);

    trigger('connected', CONNECTED_EVENT);
    expect(service.connected.value).toBeTruthy();
    expect(connectedEvent).toEqual(CONNECTED_EVENT);

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
    startSpy.and.returnValues(Promise.reject(new Error('unavailable')), Promise.resolve());
    let receivedError: unknown;
    service.connect_error.subscribe((error) => receivedError = error);

    activityService.mode = MODES.socket;
    flushMicrotasks();

    expect((receivedError as Error).message).toBe('unavailable');
    expect(startSpy).toHaveBeenCalledTimes(1);

    tick(5000);
    expect(startSpy).toHaveBeenCalledTimes(2);
    flushMicrotasks();
  }));
});
