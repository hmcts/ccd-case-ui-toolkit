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

  public socket!: Socket;
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

  public watchCases(caseIds: string[]): void {
    this.socket.emit('watch', { caseIds });
  }


  // keep small wrappers to avoid breaking callers
  public viewCase(caseId: string, isViewing?: boolean): void {
    if (isViewing) { this.startViewing(caseId); }
  }

  public editCase(caseId: string, isEditing?: boolean): void {
    if (isEditing) { this.startEditing(caseId); }
  }

  public stopCase(caseId: string, isStopping?: boolean): void {
    if (isStopping) { this.stopViewing(caseId); }
  }

  public stopAllCase(caseIds: string[], isStopping?: boolean): void {
    if (isStopping) { this.stopViewingCases(caseIds); }
  }

  /**
   * Start viewing a case (explicit).
   * Only emits when socket exists and is connected.
   */
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

  /**
   * Stop viewing a case (explicit).
   * Safe no-op if socket not connected.
   */
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

  /**
   * Stop viewing multiple cases (explicit).
   * Safe no-op if socket not connected.
   */
  public stopViewingCases(caseIds: string[]): void {
    if (!caseIds || !caseIds.length) { return; }
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

  /**
   * Start editing a case (explicit).
   */
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

  private init(): void {
    this.socket = Utils.getSocket(this.user, this.activityService.mode === MODES.socket);
    this.connect = this.getObservableOnSocketEvent<any>('connect');
    this.connect_error = this.getObservableOnSocketEvent<any>('connect_error');
    this.disconnect = this.getObservableOnSocketEvent<any>('disconnect');
    this.socketActivitySubscription?.unsubscribe();
    this.socketActivitySubscription = this.getObservableOnSocketEvent<CaseActivityInfo[]>('activity')
      .subscribe(activity => this.activitySubject.next(activity));

    this.disconnect.subscribe(() => {
      this.connected.next(false);
    });
    this.connect_error.subscribe(() => {
      this.connected.next(false);
    });
    this.connect.subscribe(() => {
      this.connected.next(true);
    });

    this.socket.connect();
  }

  private destroy(): void {
    this.socketActivitySubscription?.unsubscribe();
    this.socketActivitySubscription = undefined;
    if (this.socket) {
      this.socket.close();
      this.socket = undefined as any;
    }
  }

  private getObservableOnSocketEvent<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(event, (payload: T) => {
        observer.next(payload);
      });
    });
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
