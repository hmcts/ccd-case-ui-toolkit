import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../../domain';

@Injectable()
export class ProfileNotifier {
  public readonly profileSource: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(new Profile());
  public profile = this.profileSource.asObservable();

  public announceProfile(profile: Profile) {
    this.profileSource.next(profile);
  }

}
