import 'reflect-metadata';

import { HeaderBarComponent } from './header-bar.component';
import { ProfileNotifier } from '../../../shared/services/profile/profile.notifier';
import { ProfileService } from '../../../shared/services/profile/profile.service';

describe('HeaderBarComponent', () => {
  it('clears the profile state before emitting the sign-out request', () => {
    const profileService = jasmine.createSpyObj<ProfileService>('ProfileService', ['clearProfileCache']);
    const profileNotifier = jasmine.createSpyObj<ProfileNotifier>('ProfileNotifier', ['clearProfile']);
    const events: string[] = [];
    const component = new HeaderBarComponent(profileService, profileNotifier);

    profileService.clearProfileCache.and.callFake(() => events.push('service'));
    profileNotifier.clearProfile.and.callFake(() => events.push('notifier'));
    spyOn((component as any).signOutRequest, 'emit').and.callFake(() => events.push('sign-out'));

    component.signOut();

    expect(events).toEqual(['service', 'notifier', 'sign-out']);
  });

  it('still emits sign-out when profile services are not provided', () => {
    const component = new HeaderBarComponent(null, null);
    const emit = spyOn((component as any).signOutRequest, 'emit');

    component.signOut();

    expect(emit).toHaveBeenCalled();
  });
});
