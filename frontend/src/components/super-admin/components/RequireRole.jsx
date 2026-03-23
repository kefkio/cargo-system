// src/components/super-admin/components/RequireRole.jsx
import { useContext } from "react";
import { AuthContext } from "../../../auth/AuthContext";
import Unauthorized from "../../../auth/Unauthorized";

export default function RequireRole({ children, roles }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;

  if (!user || !roles.includes(user.role?.toLowerCase())) {
    return <Unauthorized />;
  }

  return children;
}