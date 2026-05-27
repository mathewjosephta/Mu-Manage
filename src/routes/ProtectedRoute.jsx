import { Navigate }
from "react-router-dom";

function ProtectedRoute({

  userRole,
  allowedRoles = [],
  children

}) {

  // NO ROLE

  if (!userRole) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );

  }

  // ACCESS DENIED

  if (

    !allowedRoles.includes(
      userRole
    )

  ) {

    return (
      <Navigate
        to="/"
        replace
      />
    );

  }

  // ALLOWED

  return children;

}

export default ProtectedRoute;