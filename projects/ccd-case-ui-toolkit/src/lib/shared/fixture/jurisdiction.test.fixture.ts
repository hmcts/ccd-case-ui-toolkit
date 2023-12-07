import { Jurisdiction } from '../domain';

export let createJurisdiction = () => {
  const jurisdiction = new Jurisdiction();

  jurisdiction.id = 'TEST';
  jurisdiction.name = 'test';
  jurisdiction.description = 'test';

  return jurisdiction;
};
