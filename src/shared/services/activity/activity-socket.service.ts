import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Socket } from 'socket.io-client';

import { CaseActivity } from '../../domain/activity';
import { SessionStorageService } from '../session/session-storage.service';
import { SetCaseActivity, WatchCases } from './models';
import { Utils } from './utils';

// import { Socket } from 'ngx-socket-io';
@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService {
  public activity: Observable<CaseActivity>;
  public connect: Observable<any>;
  public disconnect: Observable<any>;
  public connectionError: Observable<any>;

  public socket: Socket;
  private pUser: object;
  private get user(): object {
    return this.pUser || this.setupUser();
  }
  private get allowWebSockets(): boolean {
    return false; // Should come from config/LaunchDarkly eventually.
  }

  constructor(private readonly sessionStorageService: SessionStorageService) {
    this.socket = Utils.getSocket(this.user, this.allowWebSockets);
    this.connect = this.getObservableOnSocketEvent<any>('connect');
    this.disconnect = this.getObservableOnSocketEvent<any>('disconnect');
    this.connectionError = this.getObservableOnSocketEvent<any>('connect_error');
    this.activity = this.getObservableOnSocketEvent<CaseActivity>('activity');

    this.connect.subscribe((payload: any) => {
      console.log('ActivitySocketService.connect', payload);
    });
    this.disconnect.subscribe((payload: any) => {
      console.log('ActivitySocketService.disconnect', payload);
    });
    this.connectionError.subscribe((error: any) => {
      console.log('ActivitySocketService.connect_error', error);
    });

    this.socket.connect();
  }

  public watchCases(caseIds: string[]): void {
    const payload: WatchCases = { caseIds };
    this.socket.emit('watch', payload);
  }

  public viewCase(caseId: string): void {
    const payload: SetCaseActivity = { caseId };
    this.socket.emit('view', payload);
  }

  public editCase(caseId: string): void {
    const payload: SetCaseActivity = { caseId };
    this.socket.emit('edit', payload);
  }

  private getObservableOnSocketEvent<T>(event: string): Observable<T> {
    return new Observable<T>(observer => {
      this.socket.on(event, (payload: T) => {
        observer.next(payload);
      });
    });
  }

  private setupUser(): object {
    const userInfoStr = this.sessionStorageService.getItem('userDetails');
    this.pUser = userInfoStr ? JSON.parse(userInfoStr) : null;
    return this.pUser;
  }
}
