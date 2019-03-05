import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Profile } from '../../domain';

@Injectable()
export class ProfileNotifier {

  profileSource;

  announceProfile(profile: Profile) {
    this.profileSource = new BehaviorSubject<Profile>(profile);
  }

}
