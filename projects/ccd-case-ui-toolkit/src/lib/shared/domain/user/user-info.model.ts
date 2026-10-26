export interface UserInfo {
  uid?: string;
  id: string;
  forename: string;
  surname: string;
  email: string;
  active: boolean;
  roles: string[];
  roleCategories?: string[];
  sub?: string;
  subname?: string;
  iss?: string;
  ssoProvider?: string;
  token?: string;
  name?: string;
}
