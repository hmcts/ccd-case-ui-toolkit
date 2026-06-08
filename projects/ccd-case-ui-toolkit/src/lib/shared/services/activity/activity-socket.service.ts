import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, ReplaySubject, Subscription } from 'rxjs';
import { distinctUntilChanged, filter } from 'rxjs/operators';
import { Socket } from 'socket.io-client';

import { CaseActivityInfo } from '../../domain/activity';
import { UserInfo } from '../../domain/user';
import { SessionStorageService } from '../session/session-storage.service';
import { ActivityService } from './activity.service';
import { Utils, MODES } from './utils';
import { isSolicitorUser } from '../../utils';

interface ActivitySocketSharedState {
  socket?: Socket;
  allowWebSockets?: boolean;
  userKey?: string;
  owners: Set<object>;
  reconnectTimer?: ReturnType<typeof setTimeout>;
}

const ACTIVITY_SOCKET_SHARED_STATE_KEY = '__ccdActivitySocketSharedState__';
const ACTIVITY_SOCKET_RECONNECT_DELAY_MIN_MS = 1000;
const ACTIVITY_SOCKET_RECONNECT_DELAY_MAX_MS = 20000;

@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService {
  public static readonly SOCKET_MODES: MODES[] = [ MODES.socket, MODES.socketLongPoll ];

  public activity: Observable<CaseActivityInfo[]>;
  public connect: Observable<any> = new Observable();
  public connect_error: Observable<any> = new Observable();
  public disconnect: Observable<any> = new Observable();
  public connected: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private readonly activitySubject = new ReplaySubject<CaseActivityInfo[]>(1);
  private lastViewEmit = { caseId: '', time: 0 };
  private lastEditEmit = { caseId: '', time: 0 };
  private readonly emitCooldownMs = 250; // ignore duplicate emits within 250ms
  private socketActivitySubscription?: Subscription;
  private socketConnectSubscription?: Subscription;
  private socketConnectErrorSubscription?: Subscription;
  private socketDisconnectSubscription?: Subscription;

  public socket!: Socket;
  private pUser!: UserInfo;
  public get user(): UserInfo {
    return this.pUser || this.setupUser();
  }

  // Returns whether activity sockets are enabled and currently initialised.
  public get isEnabled(): boolean {
    return this.activityService.isEnabled && !!this.socket;
  }

  constructor(
    private readonly sessionStorageService: SessionStorageService,
    private readonly activityService: ActivityService
  ) {
    this.activity = this.activitySubject.asObservable();
    this.activityService.modeSubject
      .pipe(filter(mode => !!mode))
      .pipe(distinctUntilChanged())
      .subscribe(mode => {
        this.destroy();
        if (ActivitySocketService.SOCKET_MODES.includes(mode) && !isSolicitorUser(this.sessionStorageService)) {
          this.init();
        }
    });
  }

  // Subscribes the socket to activity updates for the supplied case IDs.
  public watchCases(caseIds: string[]): void {
    if (this.socket) {
      this.socket.emit('watch', { caseIds });
    }
  }


  // keep small wrappers to avoid breaking callers
  // Starts viewing when the legacy wrapper is called with an active viewing flag.
  public viewCase(caseId: string, isViewing?: boolean): void {
    if (isViewing) { this.startViewing(caseId); }
  }

  // Starts editing when the legacy wrapper is called with an active editing flag.
  public editCase(caseId: string, isEditing?: boolean): void {
    if (isEditing) { this.startEditing(caseId); }
  }

  // Stops viewing when the legacy wrapper is called with an active stopping flag.
  public stopCase(caseId: string, isStopping?: boolean): void {
    if (isStopping) { this.stopViewing(caseId); }
  }

  // Stops viewing multiple cases when the legacy wrapper is called with an active stopping flag.
  public stopAllCase(caseIds: string[], isStopping?: boolean): void {
    if (isStopping) { this.stopViewingCases(caseIds); }
  }

  // Emits a view event for a connected socket, with a short duplicate guard.
  public startViewing(caseId: string): void {
    if (!caseId) { return; }
    if (!this.socket || !this.connected.value) { return; } // defensive
    const now = Date.now();
    if (this.lastViewEmit.caseId === caseId && (now - this.lastViewEmit.time) < this.emitCooldownMs) {
      return; // duplicate within cooldown
    }
     
    try {
      this.socket.emit('view', { caseId });
      this.lastViewEmit = { caseId, time: now };
    } catch (e) {
      console.warn('startViewing emit failed', e);
    }
  }

  // Emits a stop event for one case and clears the last view marker.
  public stopViewing(caseId: string): void {
    if (!caseId) { return; }
    if (!this.socket || !this.connected.value) { return; }
    try {
      this.socket.emit('stop', { caseId });
      if (this.lastViewEmit.caseId === caseId) {
        this.lastViewEmit = { caseId: '', time: 0 };
      }
    } catch (e) {
      console.warn('stopViewing emit failed', e);
    }
  }

  // Emits a stopAll event for multiple cases and clears any matching view marker.
  public stopViewingCases(caseIds: string[]): void {
    if (!caseIds?.length) { return; }
    if (!this.socket || !this.connected.value) { return; }
    try {
      this.socket.emit('stopAll', { caseIds });
      if (caseIds.includes(this.lastViewEmit.caseId)) {
        this.lastViewEmit = { caseId: '', time: 0 };
      }
    } catch (e) {
      console.warn('stopViewingCases emit failed', e);
    }
  }

  // Emits an edit event for a connected socket, with a short duplicate guard.
  public startEditing(caseId: string): void {
    if (!caseId) { return; }
    if (!this.socket || !this.connected.value) { return; }
    const now = Date.now();
    if (this.lastEditEmit.caseId === caseId && (now - this.lastEditEmit.time) < this.emitCooldownMs) {
      return;
    }
 
    try {
      this.socket.emit('edit', { caseId });
      this.lastEditEmit = { caseId, time: now };
    } catch (e) {
      console.warn('startEditing emit failed', e);
    }
  }

  // Initialises this service instance against the shared socket.
  private init(): void {
    const socket = ActivitySocketService.getSharedSocket(this.user, this.activityService.mode === MODES.socket);
    ActivitySocketService.attachSharedSocketOwner(this);
    this.socket = socket;
    this.connect = this.getObservableOnSocketEvent<any>('connect');
    this.connect_error = this.getObservableOnSocketEvent<any>('connect_error');
    this.disconnect = this.getObservableOnSocketEvent<any>('disconnect');
    this.unsubscribeSocketSubscriptions();
    this.socketActivitySubscription = this.getObservableOnSocketEvent<CaseActivityInfo[]>('activity')
      .subscribe(activity => this.activitySubject.next(activity));

    this.socketDisconnectSubscription = this.disconnect.subscribe(() => {
      this.connected.next(false);
      ActivitySocketService.reconnectSharedSocketIfNeeded(socket);
    });
    this.socketConnectErrorSubscription = this.connect_error.subscribe(() => {
      this.connected.next(false);
      ActivitySocketService.reconnectSharedSocketIfNeeded(socket);
    });
    this.socketConnectSubscription = this.connect.subscribe(() => {
      ActivitySocketService.clearSharedSocketReconnect(socket);
      this.connected.next(true);
    });

    this.connected.next(socket.connected);
    if (!ActivitySocketService.isSocketActive(socket) && !ActivitySocketService.isSharedSocketReconnectPending(socket)) {
      socket.connect();
    }
  }

  // Detaches this service instance and closes the shared socket if it is the last owner.
  private destroy(): void {
    this.unsubscribeSocketSubscriptions();
    this.connected.next(false);
    if (this.socket) {
      ActivitySocketService.detachSharedSocketOwner(this, this.socket);
      this.socket = undefined as any;
    }
  }

  // Wraps a socket event as an observable and removes the listener on unsubscribe.
  private getObservableOnSocketEvent<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      const socket = this.socket;
      if (!socket) {
        observer.complete();
        return undefined;
      }

      const handler = (payload: T) => {
        observer.next(payload);
      };
      socket.on(event, handler);
      return () => socket.off(event, handler);
    });
  }

  // Clears all socket event subscriptions held by this service instance.
  private unsubscribeSocketSubscriptions(): void {
    this.socketActivitySubscription?.unsubscribe();
    this.socketActivitySubscription = undefined;
    this.socketConnectSubscription?.unsubscribe();
    this.socketConnectSubscription = undefined;
    this.socketConnectErrorSubscription?.unsubscribe();
    this.socketConnectErrorSubscription = undefined;
    this.socketDisconnectSubscription?.unsubscribe();
    this.socketDisconnectSubscription = undefined;
  }

  // Reuses the active shared socket or creates a new socket when none is active.
  private static getSharedSocket(user: UserInfo, allowWebSockets: boolean): Socket {
    const state = ActivitySocketService.sharedState;
    const userKey = JSON.stringify(user || {});
    if (
      state.socket &&
      state.userKey === userKey &&
      (ActivitySocketService.isSocketActive(state.socket) || !!state.reconnectTimer)
    ) {
      return state.socket;
    }

    ActivitySocketService.closeSharedSocket(state.socket);
    state.socket = Utils.getSocket(user, allowWebSockets);
    state.allowWebSockets = allowWebSockets;
    state.userKey = userKey;

    return state.socket;
  }

  // Stores shared socket state on globalThis so multiple service instances use one socket.
  private static get sharedState(): ActivitySocketSharedState {
    const globalScope = globalThis as typeof globalThis & {
      [ACTIVITY_SOCKET_SHARED_STATE_KEY]?: ActivitySocketSharedState
    };

    if (!globalScope[ACTIVITY_SOCKET_SHARED_STATE_KEY]) {
      globalScope[ACTIVITY_SOCKET_SHARED_STATE_KEY] = { owners: new Set<object>() };
    }

    return globalScope[ACTIVITY_SOCKET_SHARED_STATE_KEY];
  }

  // Marks a service instance as an owner of the shared socket.
  private static attachSharedSocketOwner(owner: object): void {
    ActivitySocketService.sharedState.owners.add(owner);
  }

  // Removes an owner and closes the shared socket when no owners remain.
  private static detachSharedSocketOwner(owner: object, socket: Socket): void {
    const state = ActivitySocketService.sharedState;
    state.owners.delete(owner);
    if (state.owners.size === 0 && socket === state.socket) {
      ActivitySocketService.closeSharedSocket(socket);
    }
  }

  // Closes a socket and clears shared state when it is the active shared socket.
  private static closeSharedSocket(socket?: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (!socket) {
      return;
    }

    if (socket === state.socket) {
      ActivitySocketService.clearSharedSocketReconnect(socket);
      state.socket = undefined;
      state.allowWebSockets = undefined;
      state.userKey = undefined;
      state.owners.clear();
    }
    socket.close();
  }

  // Cancels a pending reconnect timer for the active shared socket.
  private static clearSharedSocketReconnect(socket?: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (socket === state.socket && state.reconnectTimer) {
      clearTimeout(state.reconnectTimer);
      state.reconnectTimer = undefined;
    }
  }

  // Checks whether the active shared socket already has a reconnect pending.
  private static isSharedSocketReconnectPending(socket: Socket): boolean {
    const state = ActivitySocketService.sharedState;
    return socket === state.socket && !!state.reconnectTimer;
  }

  // Schedules one controlled reconnect for websocket mode after a failure event.
  private static reconnectSharedSocketIfNeeded(socket: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (!state.allowWebSockets || socket !== state.socket || state.owners.size === 0 || state.reconnectTimer) {
      return;
    }

    console.warn('Activity socket connection lost, scheduling reconnect...'); 

    state.reconnectTimer = setTimeout(() => {
      state.reconnectTimer = undefined;
      if (socket === state.socket && state.owners.size > 0 && !ActivitySocketService.isSocketActive(socket)) {
        socket.connect();
      }
    }, ActivitySocketService.getReconnectDelayMs());

    if (ActivitySocketService.isSocketActive(socket)) {
      socket.disconnect();
    }
  }

  private static getReconnectDelayMs(): number {
    const delayRange = ACTIVITY_SOCKET_RECONNECT_DELAY_MAX_MS - ACTIVITY_SOCKET_RECONNECT_DELAY_MIN_MS + 1;
    const randomDelay = ActivitySocketService.getCryptoRandomInt(delayRange) + ACTIVITY_SOCKET_RECONNECT_DELAY_MIN_MS;
    console.log(`Activity socket reconnect scheduled in ${randomDelay}ms`);  
    return randomDelay;
  }

  // Returns an unbiased crypto-random integer from 0 inclusive to exclusiveMax exclusive.
  private static getCryptoRandomInt(exclusiveMax: number): number {
    const randomValue = new Uint32Array(1);
    const maxUnbiasedValue = Math.floor(0x100000000 / exclusiveMax) * exclusiveMax;

    do {
      globalThis.crypto.getRandomValues(randomValue);
    } while (randomValue[0] >= maxUnbiasedValue);

    return randomValue[0] % exclusiveMax;
  }

  // Treats connected, connecting, opening, and open sockets as active.
  private static isSocketActive(socket?: Socket): boolean {
    if (!socket) {
      return false;
    }

    const socketIo = socket.io as any;
    const readyState = socketIo?._readyState || socketIo?.engine?.readyState;
    return socket.connected || socket.active || readyState === 'opening' || readyState === 'open';
  }

  // Loads the current user from session storage and removes the token before socket use.
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
