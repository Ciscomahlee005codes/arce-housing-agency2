import { Navigate } from "react-router-dom";
import { useAuth }
from "../context/AuthContext";

const RoleRoute = ({
  children,
  allowedRoles,
}) => {

  const {
    user,
    profile,
    loading,
  } = useAuth();

  if (loading) {
    return <h1>Loading...</h1>;
  }

  if (!user) {
    return (
      <Navigate to="/login" />
    );
  }

  // BLOCK WRONG ROLES
  if (
    !allowedRoles.includes(
      profile?.role
    )
  ) {
    return <Navigate to="/" />;
  }

  return children;
};

export default RoleRoute;