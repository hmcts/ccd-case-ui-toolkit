export interface UserInfo {
  uid?: string ,
  id: string,
  forename: string,
  surname: string,
  email: string,
  active: boolean,
  roles: string[],
  roleCategories: string[]
}
