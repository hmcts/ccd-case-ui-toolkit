import { Type } from 'class-transformer';
import { Jurisdiction } from '../definition/jurisdiction.model';

// @dynamic
export class Profile {
  user: {
    idam: {
      id: string,
      email: string
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
    return this.user.idam.roles.find(r => r.endsWith('-solicitor')) !== undefined;
  }
}
