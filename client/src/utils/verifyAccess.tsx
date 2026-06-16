import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser, hasProfile } from "./auth";

interface VerifyAccessProps {
  children: ReactNode;
  allowedProfiles: string[];
}

export default function VerifyAccess({ children, allowedProfiles }: VerifyAccessProps) {
  const location = useLocation();
  const isAllowed = hasProfile(allowedProfiles);
  const user = getStoredUser();

  useEffect(() => {
    if (!user) {
      window.history.replaceState({}, "", "/login");
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (!isAllowed) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
