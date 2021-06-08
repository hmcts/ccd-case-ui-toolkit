import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
import { Profile } from '../../domain';
import { Activity } from '../../domain/activity';

@Injectable({
  providedIn: 'root'
})
export class ActivitySocketService {
  public activity = this.socket.fromEvent<Activity>('activity');
  public connect = this.socket.fromEvent<any>('connect');

  constructor(private socket: Socket) { }

  public registerUser(profile: Profile) {
    let user = {} as any;
    if (profile.user && profile.user.idam) {
      user = profile.user.idam;
    }
    this.socket.emit('register', user);
  }

  public watchCases(caseIds: string[]) {
    this.socket.emit('watch', { caseIds });
  }

  public viewCase(caseId: string) {
    this.socket.emit('view', { caseId });
  }

  public editCase(caseId: string) {
    this.socket.emit('edit', { caseId });
  }

}
