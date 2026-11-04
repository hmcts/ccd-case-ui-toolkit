import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Profile } from '../../domain/profile/profile.model';
import { ProfileNotifier } from './profile.notifier';
import { ProfileService } from './profile.service';

@Injectable()
export class ProfileResolver implements Resolve<Profile> {
  constructor(
    private readonly profileService: ProfileService,
    private readonly profileNotifier: ProfileNotifier
  ) {}

  public resolve(): Observable<Profile> {
    return this.profileService.get().pipe(
      tap(profile => this.profileNotifier.announceProfile(profile))
    );
  }
}
