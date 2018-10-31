import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { Profile } from './profile.model';

@Injectable()
export class ProfileNotifier {

  profileSource = new Subject<Profile>();

  announceProfile(profile: Profile) {
    this.profileSource.next(profile);
  }

}
