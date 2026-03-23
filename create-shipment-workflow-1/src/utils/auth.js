import { getUserRole } from './user'; // Assuming there's a user utility to get the current user's role

export const isStaff = () => {
  const role = getUserRole();
  return role === 'staff';
};

export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin';
};

export const canCreateShipment = () => {
  return isStaff() || isAdmin();
};