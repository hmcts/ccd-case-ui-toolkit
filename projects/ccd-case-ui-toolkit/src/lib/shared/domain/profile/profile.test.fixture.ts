import { Profile } from './profile.model';

export const createAProfile = () => {
  const p = new Profile();
  p.user = {
    idam: {
      id: '42',
      email: 'user@test.com',
      forename: 'Test',
      surname: 'User',
      roles: ['caseworker-divorce']
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

export const createASolicitorProfile = () => {
  const p = new Profile();
  p.user = {
    idam: {
      id: '44',
      email: 'solicitor@test.com',
      forename: 'Test',
      surname: 'Solicitor',
      roles: ['divorce-solicitor']
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
