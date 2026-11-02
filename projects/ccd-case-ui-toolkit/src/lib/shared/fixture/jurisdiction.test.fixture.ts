import { Jurisdiction } from '../domain';

export const createJurisdiction = () => {
  const jurisdiction = new Jurisdiction();

  jurisdiction.id = 'TEST';
  jurisdiction.name = 'test';
  jurisdiction.description = 'test';

  return jurisdiction;
};
