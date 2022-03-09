import { Type } from 'class-transformer';
import { Jurisdiction } from '../definition/jurisdiction.model';

function hasRoles(profile: Profile): boolean {
  if (profile.user && profile.user.idam && Array.isArray(profile.user.idam.roles)) {
    return profile.user.idam.roles.length > 0;
  }
  return false;
}

// @dynamic
export class Profile {
  user: {
    idam: {
      id: string,
      email: string,
      forename: string,
      surname: string,
      roles: string[]
    }
  };

  channels: string[];

  @Type(() => Jurisdiction)
  jurisdictions: Jurisdiction[];

  default: {
    workbasket: {
      jurisdiction_id: string,
      case_type_id: string,
      state_id: string
    }
  };

  isSolicitor(): boolean {
    if (hasRoles(this)) {
      return this.user.idam.roles.find(r => r.endsWith('-solicitor')) !== undefined;
    }
    return false;
  }

  isCourtAdmin(): boolean {
    if (hasRoles(this)) {
      return this.user.idam.roles.find(r => r.endsWith('-courtadmin')) !== undefined;
    }
    return false;
  }
}
