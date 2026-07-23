import { Injectable, OnDestroy } from '@angular/core';
import {
  OnConnectedArgs,
  OnDisconnectedArgs,
  OnServerDataMessageArgs,
  WebPubSubClient
} from '@azure/web-pubsub-client';
import { BehaviorSubject, firstValueFrom, Observable, ReplaySubject, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';

import { CaseActivityInfo } from '../../domain/activity';
import { UserInfo } from '../../domain/user';
import { isSolicitorUser } from '../../utils';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivityService } from './activity.service';
import { MODES } from './utils';

interface ActivityWebPubSubSharedState {
  client?: WebPubSubClient;
  userKey?: string;
  owners: Set<ActivitySocketService>;
  connected?: boolean;
  startPromise?: Promise<void>;
  closeTimer?: ReturnType<typeof setTimeout>;
  restartTimer?: ReturnType<typeof setTimeout>;
}

interface ActivityServerMessage {
  event?: string;
  data?: CaseActivityInfo[];
}

const ACTIVITY_WEB_PUBSUB_SHARED_STATE_KEY = '__ccdActivityWebPubSubSharedState__';
const ACTIVITY_WEB_PUBSUB_CLOSE_GRACE_MS = 5000;
const ACTIVITY_WEB_PUBSUB_RESTART_DELAY_MS = 5000;

/**
 * Provides the real-time case activity API.
 *
 * The class name and socket mode values are retained for backwards compatibility with
 * consuming applications and their LaunchDarkly configuration. The underlying transport
 * is Azure Web PubSub.
 */
@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService implements OnDestroy {
  public static readonly SOCKET_MODES: MODES[] = [MODES.socket, MODES.socketLongPoll];

  public readonly activity: Observable<CaseActivityInfo[]>;
  public readonly connect: Observable<OnConnectedArgs>;
  public readonly connect_error: Observable<unknown>;
  public readonly disconnect: Observable<OnDisconnectedArgs>;
  public readonly connected = new BehaviorSubject<boolean>(false);

  public socket!: WebPubSubClient;

  private readonly activitySubject = new ReplaySubject<CaseActivityInfo[]>(1);
  private readonly connectSubject = new Subject<OnConnectedArgs>();
  private readonly connectErrorSubject = new Subject<unknown>();
  private readonly disconnectSubject = new Subject<OnDisconnectedArgs>();
  private lastViewEmit = { caseId: '', time: 0 };
  private lastEditEmit = { caseId: '', time: 0 };
  private readonly emitCooldownMs = 250;
  private modeSubscription?: Subscription;
  private pUser!: UserInfo;

  public get user(): UserInfo {
    return this.pUser || this.setupUser();
  }

  public get isEnabled(): boolean {
    return this.activityService.isEnabled && !!this.socket;
  }

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly activityService: ActivityService
  ) {
    this.activity = this.activitySubject.asObservable();
    this.connect = this.connectSubject.asObservable();
    this.connect_error = this.connectErrorSubject.asObservable();
    this.disconnect = this.disconnectSubject.asObservable();

    this.modeSubscription = this.activityService.modeSubject
      .pipe(filter((mode) => !!mode), distinctUntilChanged())
      .subscribe((mode) => {
        this.destroy();
        if (ActivitySocketService.SOCKET_MODES.includes(mode) && !isSolicitorUser(this.sessionStorageService)) {
          this.init();
        }
      });
  }

  public ngOnDestroy(): void {
    this.modeSubscription?.unsubscribe();
    this.modeSubscription = undefined;
    this.destroy();
  }

  public watchCases(caseIds: string[]): void {
    if (caseIds) {
      this.sendEvent('watch', { caseIds });
    }
  }

  // These wrappers are retained to avoid breaking current toolkit consumers.
  public viewCase(caseId: string, isViewing?: boolean): void {
    if (isViewing) {
      this.startViewing(caseId);
    }
  }

  public editCase(caseId: string, isEditing?: boolean): void {
    if (isEditing) {
      this.startEditing(caseId);
    }
  }

  public stopCase(caseId: string, isStopping?: boolean): void {
    if (isStopping) {
      this.stopViewing(caseId);
    }
  }

  public stopAllCase(caseIds: string[], isStopping?: boolean): void {
    if (isStopping) {
      this.stopViewingCases(caseIds);
    }
  }

  public startViewing(caseId: string): void {
    if (!caseId || !this.connected.value) {
      return;
    }

    const now = Date.now();
    if (this.lastViewEmit.caseId === caseId && now - this.lastViewEmit.time < this.emitCooldownMs) {
      return;
    }

    this.sendEvent('view', { caseId });
    this.lastViewEmit = { caseId, time: now };
  }

  public stopViewing(caseId: string): void {
    if (!caseId || !this.connected.value) {
      return;
    }

    this.sendEvent('stop', { caseId });
    if (this.lastViewEmit.caseId === caseId) {
      this.lastViewEmit = { caseId: '', time: 0 };
    }
  }

  public stopViewingCases(caseIds: string[]): void {
    if (!caseIds?.length || !this.connected.value) {
      return;
    }

    this.sendEvent('stopAll', { caseIds });
    if (caseIds.includes(this.lastViewEmit.caseId)) {
      this.lastViewEmit = { caseId: '', time: 0 };
    }
  }

  public startEditing(caseId: string): void {
    if (!caseId || !this.connected.value) {
      return;
    }

    const now = Date.now();
    if (this.lastEditEmit.caseId === caseId && now - this.lastEditEmit.time < this.emitCooldownMs) {
      return;
    }

    this.sendEvent('edit', { caseId });
    this.lastEditEmit = { caseId, time: now };
  }

  private init(): void {
    const client = ActivitySocketService.getSharedClient(this.user, this.activityService);
    this.socket = client;
    ActivitySocketService.attachSharedClientOwner(this);
    this.connected.next(ActivitySocketService.sharedState.connected === true);
    ActivitySocketService.startSharedClientIfNeeded(client);
  }

  private destroy(): void {
    this.connected.next(false);
    if (this.socket) {
      ActivitySocketService.detachSharedClientOwner(this, this.socket);
      this.socket = undefined as any;
    }
  }

  private sendEvent(eventName: string, data: object): void {
    if (!this.socket || !this.connected.value) {
      return;
    }

    this.socket.sendEvent(eventName, data, 'json').catch((error) => {
      console.warn(`Activity Web PubSub ${eventName} event failed`, error);
      this.connectErrorSubject.next(error);
    });
  }

  private handleConnected(event: OnConnectedArgs): void {
    this.connected.next(true);
    this.connectSubject.next(event);
  }

  private handleDisconnected(event: OnDisconnectedArgs): void {
    this.connected.next(false);
    this.disconnectSubject.next(event);
  }

  private handleConnectError(error: unknown): void {
    this.connected.next(false);
    this.connectErrorSubject.next(error);
  }

  private handleServerMessage(event: OnServerDataMessageArgs): void {
    const payload = ActivitySocketService.parseServerMessage(event.message.data);
    if (payload?.event === 'activity' && Array.isArray(payload.data)) {
      this.activitySubject.next(payload.data);
    }
  }

  private static getSharedClient(user: UserInfo, activityService: ActivityService): WebPubSubClient {
    const state = ActivitySocketService.sharedState;
    const userKey = JSON.stringify(user || {});

    if (state.client && state.userKey === userKey) {
      return state.client;
    }

    ActivitySocketService.closeSharedClient(state.client);
    const client = new WebPubSubClient(
      {
        getClientAccessUrl: async () => {
          const connection = await firstValueFrom(activityService.negotiateWebPubSubConnection());
          if (!connection?.url) {
            throw new Error('Web PubSub negotiation did not return a connection URL');
          }
          return connection.url;
        }
      },
      {
        autoReconnect: true,
        reconnectRetryOptions: {
          maxRetries: 10,
          mode: 'Exponential',
          retryDelayInMs: 1000,
          maxRetryDelayInMs: 20000
        }
      }
    );

    state.client = client;
    state.userKey = userKey;
    state.connected = false;
    ActivitySocketService.registerSharedClientEvents(client);
    return client;
  }

  private static registerSharedClientEvents(client: WebPubSubClient): void {
    client.on('connected', (event) => {
      const state = ActivitySocketService.sharedState;
      if (client !== state.client) {
        return;
      }
      state.connected = true;
      ActivitySocketService.clearSharedClientRestart(client);
      state.owners.forEach((owner) => owner.handleConnected(event));
    });

    client.on('disconnected', (event) => {
      const state = ActivitySocketService.sharedState;
      if (client !== state.client) {
        return;
      }
      state.connected = false;
      state.owners.forEach((owner) => owner.handleDisconnected(event));
    });

    client.on('stopped', () => {
      const state = ActivitySocketService.sharedState;
      if (client !== state.client) {
        return;
      }
      state.connected = false;
      ActivitySocketService.scheduleSharedClientRestart(client);
    });

    client.on('server-message', (event) => {
      const state = ActivitySocketService.sharedState;
      if (client === state.client) {
        state.owners.forEach((owner) => owner.handleServerMessage(event));
      }
    });
  }

  private static parseServerMessage(data: unknown): ActivityServerMessage | undefined {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data) as ActivityServerMessage;
      } catch (error) {
        console.warn('Failed to parse activity Web PubSub server message', error);
        return undefined;
      }
    }
    if (data && typeof data === 'object' && !(data instanceof ArrayBuffer)) {
      return data as ActivityServerMessage;
    }
    return undefined;
  }

  private static get sharedState(): ActivityWebPubSubSharedState {
    const globalScope = globalThis as typeof globalThis & {
      [ACTIVITY_WEB_PUBSUB_SHARED_STATE_KEY]?: ActivityWebPubSubSharedState
    };

    if (!globalScope[ACTIVITY_WEB_PUBSUB_SHARED_STATE_KEY]) {
      globalScope[ACTIVITY_WEB_PUBSUB_SHARED_STATE_KEY] = {
        owners: new Set<ActivitySocketService>()
      };
    }
    return globalScope[ACTIVITY_WEB_PUBSUB_SHARED_STATE_KEY];
  }

  private static attachSharedClientOwner(owner: ActivitySocketService): void {
    const state = ActivitySocketService.sharedState;
    ActivitySocketService.clearSharedClientCloseTimer();
    state.owners.add(owner);
  }

  private static detachSharedClientOwner(owner: ActivitySocketService, client: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    state.owners.delete(owner);
    if (client === state.client && state.owners.size === 0) {
      ActivitySocketService.scheduleSharedClientClose(client);
    }
  }

  private static scheduleSharedClientClose(client: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    if (client !== state.client || state.closeTimer) {
      return;
    }

    state.closeTimer = setTimeout(() => {
      state.closeTimer = undefined;
      if (client === state.client && state.owners.size === 0) {
        ActivitySocketService.closeSharedClient(client);
      }
    }, ACTIVITY_WEB_PUBSUB_CLOSE_GRACE_MS);
  }

  private static clearSharedClientCloseTimer(): void {
    const state = ActivitySocketService.sharedState;
    if (state.closeTimer) {
      clearTimeout(state.closeTimer);
      state.closeTimer = undefined;
    }
  }

  private static closeSharedClient(client?: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    if (!client) {
      return;
    }

    if (client === state.client) {
      ActivitySocketService.clearSharedClientCloseTimer();
      ActivitySocketService.clearSharedClientRestart(client);
      state.client = undefined;
      state.userKey = undefined;
      state.connected = false;
      state.startPromise = undefined;
      state.owners.clear();
    }
    client.stop();
  }

  private static startSharedClientIfNeeded(client: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    if (
      client !== state.client ||
      state.connected ||
      state.startPromise ||
      state.restartTimer ||
      state.owners.size === 0
    ) {
      return;
    }

    state.startPromise = client.start()
      .catch((error) => {
        if (client === state.client) {
          state.owners.forEach((owner) => owner.handleConnectError(error));
          ActivitySocketService.scheduleSharedClientRestart(client);
        }
      })
      .finally(() => {
        if (client === state.client) {
          state.startPromise = undefined;
        }
      });
  }

  private static scheduleSharedClientRestart(client: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    if (client !== state.client || state.owners.size === 0 || state.restartTimer) {
      return;
    }

    state.restartTimer = setTimeout(() => {
      state.restartTimer = undefined;
      if (client === state.client && state.owners.size > 0 && !state.connected) {
        ActivitySocketService.startSharedClientIfNeeded(client);
      }
    }, ACTIVITY_WEB_PUBSUB_RESTART_DELAY_MS);
  }

  private static clearSharedClientRestart(client: WebPubSubClient): void {
    const state = ActivitySocketService.sharedState;
    if (client === state.client && state.restartTimer) {
      clearTimeout(state.restartTimer);
      state.restartTimer = undefined;
    }
  }

  private setupUser(): UserInfo {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    const user = userInfoStr ? JSON.parse(userInfoStr) : null;
    if (user) {
      delete user.token;
    }
    this.pUser = user;
    return this.pUser;
  }
}
