export interface Caseworker {
  firstName: string;
  lastName: string;
  idamId: string;
  email: string;
  location: Location;
  roleCategories: string[];
  service?: string;
}
