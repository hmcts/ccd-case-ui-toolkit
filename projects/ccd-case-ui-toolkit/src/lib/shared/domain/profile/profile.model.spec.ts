import { createAProfile } from './profile.test.fixture';

describe('Profile', () => {
  it('isSolicitor returns true when a solicitor role exists', () => {
    const profile = createAProfile();
    profile.user.idam.roles = ['role1', 'caseworker-test-solicitor'];

    expect(profile.isSolicitor()).toBe(true);
  });

  it('isSolicitor returns false when no solicitor role exists', () => {
    const profile = createAProfile();
    profile.user.idam.roles = ['role1', 'role2'];

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isSolicitor returns false when roles is empty', () => {
    const profile = createAProfile();
    profile.user.idam.roles = [];

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isSolicitor returns false when there is no roles property', () => {
    const profile = createAProfile();
    profile.user.idam.roles = undefined;

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isSolicitor returns false when there is no idam property', () => {
    const profile = createAProfile();
    profile.user.idam = undefined;

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isSolicitor returns false when there is no user', () => {
    const profile = createAProfile();
    profile.user = undefined;

    expect(profile.isSolicitor()).toBe(false);
  });

  it('isCourtAdmin returns true when a courtadmin role exists', () => {
    const profile = createAProfile();
    profile.user.idam.roles = ['role1', 'caseworker-publiclaw-courtadmin'];

    expect(profile.isCourtAdmin()).toBe(true);
  });

  it('isCourtAdmin returns false when no courtadmin role exists', () => {
    const profile = createAProfile();
    profile.user.idam.roles = ['role1', 'role2'];

    expect(profile.isCourtAdmin()).toBe(false);
  });

  it('isCourtAdmin returns false when roles is empty', () => {
    const profile = createAProfile();
    profile.user.idam.roles = [];

    expect(profile.isCourtAdmin()).toBe(false);
  });

  it('isCourtAdmin returns false when there is no roles property', () => {
    const profile = createAProfile();
    profile.user.idam.roles = undefined;

    expect(profile.isCourtAdmin()).toBe(false);
  });

  it('isCourtAdmin returns false when there is no idam property', () => {
    const profile = createAProfile();
    profile.user.idam = undefined;

    expect(profile.isCourtAdmin()).toBe(false);
  });

  it('isCourtAdmin returns false when there is no user', () => {
    const profile = createAProfile();
    profile.user = undefined;

    expect(profile.isCourtAdmin()).toBe(false);
  });
});
