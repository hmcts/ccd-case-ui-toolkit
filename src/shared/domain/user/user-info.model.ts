export interface UserInfo {
  uid: string | null,
  id: string,
  forename: string,
  surname: string,
  email: string,
  active: boolean,
  roles: string[],
  roleCategories: string[]
}
