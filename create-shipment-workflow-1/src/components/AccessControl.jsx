import React from 'react';
import { Redirect } from 'react-router-dom';
import { isStaff, isAdmin } from '../utils/auth';

const AccessControl = ({ children }) => {
  const userRole = localStorage.getItem('userRole'); // Assuming user role is stored in localStorage

  if (!isStaff(userRole) && !isAdmin(userRole)) {
    return <Redirect to="/unauthorized" />;
  }

  return <>{children}</>;
};

export default AccessControl;