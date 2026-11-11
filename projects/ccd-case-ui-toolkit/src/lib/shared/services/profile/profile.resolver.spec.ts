import 'reflect-metadata';
import { of } from 'rxjs';
import { Profile } from '../../domain/profile/profile.model';
import { createAProfile } from '../../domain/profile/profile.test.fixture';
import { ProfileNotifier } from './profile.notifier';
import { ProfileResolver } from './profile.resolver';
import { ProfileService } from './profile.service';
import createSpyObj = jasmine.createSpyObj;

describe('ProfileResolver', () => {
  const profile: Profile = createAProfile();
  let profileService: jasmine.SpyObj<ProfileService>;
  let profileNotifier: ProfileNotifier;
  let resolver: ProfileResolver;

  beforeEach(() => {
    profileService = createSpyObj<ProfileService>('profileService', ['get']);
    profileService.get.and.returnValue(of(profile));
    profileNotifier = new ProfileNotifier();
    spyOn(profileNotifier, 'announceProfile').and.callThrough();
    resolver = new ProfileResolver(profileService, profileNotifier);
  });

  it('should return the cached service observable and announce the profile', () => {
    let resolvedProfile: Profile;

    resolver.resolve().subscribe(value => resolvedProfile = value);

    expect(resolvedProfile).toBe(profile);
    expect(profileService.get).toHaveBeenCalledTimes(1);
    expect(profileNotifier.announceProfile).toHaveBeenCalledWith(profile);
  });
});
