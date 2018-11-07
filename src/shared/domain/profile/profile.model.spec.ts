import { createAProfile } from './profile.test.fixture';

describe('Profile', () => {
  it('isSolicitor returns true when a solicitor role exists', () => {

    let profile = createAProfile();
    profile.user.idam.roles = ['role1', 'caseworker-test-solicitor'];

    expect(profile.isSolicitor()).toBe(true);
  });

  it('isSolicitor returns false when no solicitor role exists', () => {

    let profile = createAProfile();
    profile.user.idam.roles = ['role1', 'role2'];

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isSolicitor returns false when roles is empty', () => {

    let profile = createAProfile();
    profile.user.idam.roles = [];

    expect(profile.isSolicitor()).toBe(false);
  });
});
