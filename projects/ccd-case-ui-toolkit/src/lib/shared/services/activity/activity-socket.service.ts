import { Injectable, OnDestroy } from '@angular/core';
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
  connectRequested?: boolean;
  closeTimer?: ReturnType<typeof setTimeout>;
}

const ACTIVITY_SOCKET_SHARED_STATE_KEY = '__ccdActivitySocketSharedState__';
const ACTIVITY_SOCKET_CLOSE_GRACE_MS = 5000;
const ACTIVITY_SOCKET_ACTIVE_READY_STATES = new Set(['connecting', 'opening', 'open']);

@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService implements OnDestroy {
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
  private modeSubscription?: Subscription;

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
    this.modeSubscription = this.activityService.modeSubject
      .pipe(filter(mode => !!mode))
      .pipe(distinctUntilChanged())
      .subscribe(mode => {
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
      ActivitySocketService.clearSharedSocketConnectRequest(socket);
      this.connected.next(false);
    });
    this.socketConnectErrorSubscription = this.connect_error.subscribe(() => {
      ActivitySocketService.clearSharedSocketConnectRequest(socket);
      this.connected.next(false);
    });
    this.socketConnectSubscription = this.connect.subscribe(() => {
      ActivitySocketService.clearSharedSocketConnectRequest(socket);
      this.connected.next(true);
    });

    this.connected.next(socket.connected);
    ActivitySocketService.connectSharedSocketIfNeeded(socket);
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

  // Reuses the active or already-owned shared socket, otherwise creates a new one.
  private static getSharedSocket(user: UserInfo, allowWebSockets: boolean): Socket {
    const state = ActivitySocketService.sharedState;
    const userKey = JSON.stringify(user || {});
    if (
      state.socket &&
      state.userKey === userKey &&
      state.allowWebSockets === allowWebSockets &&
      ActivitySocketService.shouldReuseSharedSocket(state)
    ) {
      return state.socket;
    }

    ActivitySocketService.closeSharedSocket(state.socket);
    state.socket = Utils.getSocket(user, allowWebSockets);
    state.allowWebSockets = allowWebSockets;
    state.userKey = userKey;

    return state.socket;
  }

  private static shouldReuseSharedSocket(state: ActivitySocketSharedState): boolean {
    return ActivitySocketService.isSocketActive(state.socket) ||
      !!state.connectRequested ||
      !!state.closeTimer ||
      state.owners.size > 0;
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
    ActivitySocketService.clearSharedSocketCloseTimer();
    ActivitySocketService.sharedState.owners.add(owner);
  }

  // Removes an owner and closes the shared socket when no owners remain.
  private static detachSharedSocketOwner(owner: object, socket: Socket): void {
    const state = ActivitySocketService.sharedState;
    state.owners.delete(owner);
    if (state.owners.size === 0 && socket === state.socket) {
      ActivitySocketService.scheduleSharedSocketClose(socket);
    }
  }

  // Gives Angular a short handover window so provider churn does not create a new 101.
  private static scheduleSharedSocketClose(socket: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (socket !== state.socket || state.closeTimer) {
      return;
    }

    state.closeTimer = setTimeout(() => {
      state.closeTimer = undefined;
      if (socket === state.socket && state.owners.size === 0) {
        ActivitySocketService.closeSharedSocket(socket);
      }
    }, ACTIVITY_SOCKET_CLOSE_GRACE_MS);
  }

  private static clearSharedSocketCloseTimer(socket?: Socket): void {
    const state = ActivitySocketService.sharedState;
    if ((!socket || socket === state.socket) && state.closeTimer) {
      clearTimeout(state.closeTimer);
      state.closeTimer = undefined;
    }
  }

  // Closes a socket and clears shared state when it is the active shared socket.
  private static closeSharedSocket(socket?: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (!socket) {
      return;
    }

    if (socket === state.socket) {
      ActivitySocketService.clearSharedSocketCloseTimer(socket);
      ActivitySocketService.clearSharedSocketConnectRequest(socket);
      state.socket = undefined;
      state.allowWebSockets = undefined;
      state.userKey = undefined;
      state.owners.clear();
    }
    socket.close();
  }

  // Starts a shared socket connection only when one is not already active or pending.
  private static connectSharedSocketIfNeeded(socket: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (
      socket !== state.socket ||
      ActivitySocketService.isSocketActive(socket) ||
      state.connectRequested
    ) {
      return;
    }

    state.connectRequested = true;
    try {
      socket.connect();
    } catch (error) {
      ActivitySocketService.clearSharedSocketConnectRequest(socket);
      throw error;
    }
  }

  private static clearSharedSocketConnectRequest(socket?: Socket): void {
    const state = ActivitySocketService.sharedState;
    if (socket === state.socket) {
      state.connectRequested = undefined;
    }
  }

  // Treats connected, connecting, opening, and open sockets as active.
  private static isSocketActive(socket?: Socket): boolean {
    if (!socket) {
      return false;
    }

    const socketIo = socket.io as any;
    return socket.connected ||
      socket.active ||
      ACTIVITY_SOCKET_ACTIVE_READY_STATES.has(socketIo?._readyState) ||
      ACTIVITY_SOCKET_ACTIVE_READY_STATES.has(socketIo?.engine?.readyState);
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
