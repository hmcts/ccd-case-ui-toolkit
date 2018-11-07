import { Profile } from './profile.model';

export let createAProfile = () => {
  const p = new Profile();
  p.user = {
    idam: {
      id: '42',
      email: 'user@test.com',
      forename: 'Test',
      surname: 'User',
      roles: []
    }
  };

  p.default = {
    workbasket: {
      jurisdiction_id: 'TEST',
      case_type_id: 'TEST',
      state_id: 'TEST'
    }
  };

  return p;
};
