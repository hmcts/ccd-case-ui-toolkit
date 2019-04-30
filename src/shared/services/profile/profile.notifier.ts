import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../../domain';

@Injectable()
export class ProfileNotifier {

  private profileSource: BehaviorSubject<Profile> = new BehaviorSubject<Profile>(new Profile());
  profile = this.profileSource.asObservable();

  announceProfile(profile: Profile) {
    this.profileSource.next(profile);
  }

}
