export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
  permissions: string[];
  areaIds: string[];
  employeeId?: string | null;
}
